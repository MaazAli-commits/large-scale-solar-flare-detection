import os
import argparse
import logging
import numpy as np
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.sql.types import IntegerType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--partition", type=str, required=True, help="Partition to process, e.g., 'partition2'")
    parser.add_argument("--goes_parquet", type=str, default="file:///home/maaz/solar-flare-project/data/processed/goes_flux.parquet")
    return parser.parse_args()

def main():
    args = parse_args()
    
    swan_parquet = f"file:///home/maaz/solar-flare-project/data/processed/{args.partition}.parquet"
    output_dir = f"file:///home/maaz/solar-flare-project/data/features/{args.partition}_final.parquet"
    
    spark = SparkSession.builder \
        .appName(f"GOES Feature Engineering - {args.partition}") \
        .master("local[*]") \
        .config("spark.driver.memory", "8g") \
        .config("spark.executor.memory", "8g") \
        .getOrCreate()
        
    logger.info("Reading GOES data...")
    goes_df = spark.read.parquet(args.goes_parquet)
    
    goes_df = goes_df.withColumn("ts_seconds", F.unix_timestamp("GOES_Timestamp"))
    
    logger.info("Calculating rolling windows using Pandas...")
    goes_pd = goes_df.toPandas()
    goes_pd['GOES_Timestamp'] = pd.to_datetime(goes_pd['GOES_Timestamp'])
    goes_pd = goes_pd.sort_values("GOES_Timestamp").set_index("GOES_Timestamp")
    
    goes_pd['goes_xrsb_max_24h'] = goes_pd['xrsb'].rolling('24h').max()
    goes_pd['goes_xrsb_mean_12h'] = goes_pd['xrsb'].rolling('12h').mean()
    goes_pd['goes_xrsb_1h_derivative'] = goes_pd['xrsb'] - goes_pd['xrsb'].shift(60) 
    
    goes_pd = goes_pd.reset_index()
    
    logger.info("Converting back to Spark DataFrame...")
    goes_features = spark.createDataFrame(goes_pd)
    goes_features.cache()
    logger.info(f"Calculated GOES features for {goes_features.count()} timestamps.")
    
    logger.info(f"Reading SWAN data from {swan_parquet}...")
    swan_df = spark.read.parquet(swan_parquet)
    
    # We round SWAN-SF timestamps to the nearest minute to match GOES cleanly
    swan_df = swan_df.withColumn("Timestamp", F.to_timestamp(F.col("Timestamp"))) \
                     .withColumn("Timestamp", F.date_trunc("minute", F.col("Timestamp")))

    swan_candidates = swan_df.withColumn("offset_mins", F.array([F.lit(i) for i in range(1, 6)])) \
                             .select("*", F.posexplode("offset_mins").alias("match_pos", "offset_min")) \
                             .withColumn("candidate_ts", F.expr("Timestamp - INTERVAL 1 MINUTE * offset_min"))
                             
    logger.info("Joining SWAN with GOES features...")
    goes_features_renamed = goes_features.withColumnRenamed("GOES_Timestamp", "candidate_ts")
    joined = swan_candidates.join(
        F.broadcast(goes_features_renamed),
        on="candidate_ts",
        how="left"
    )
    
    window_dedup = Window.partitionBy("HARPNUM", "Timestamp").orderBy(
        F.when(F.col("xrsb").isNotNull(), 0).otherwise(1),
        "match_pos"
    )
    
    final_df = joined.withColumn("rn", F.row_number().over(window_dedup)) \
                     .filter(F.col("rn") == 1) \
                     .drop("rn", "offset_mins", "offset_min", "candidate_ts")
                     
    total_rows = final_df.count()
    exact_matches = final_df.filter((F.col("match_pos") == 0) & (F.col("xrsb").isNotNull())).count()
    fallback_matches = final_df.filter((F.col("match_pos") > 0) & (F.col("xrsb").isNotNull())).count()
    missing_matches = final_df.filter(F.col("xrsb").isNull()).count()
    
    logger.info(f"Total SWAN Rows: {total_rows}")
    logger.info(f"Exact Matches (T-1m): {exact_matches}")
    logger.info(f"Fallback Matches (T-2m to T-5m): {fallback_matches}")
    logger.info(f"Missing GOES Data: {missing_matches}")
    
    logger.info(f"Saving final dataset to {output_dir}")
    final_df.write.mode("overwrite").parquet(output_dir)
    logger.info("Done.")
    
    spark.stop()

if __name__ == "__main__":
    main()
