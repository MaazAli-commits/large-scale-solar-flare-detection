import argparse
from pyspark.sql import SparkSession, Window
import pyspark.sql.functions as F
from pyspark.sql.types import LongType
import time

def main():
    print("Starting SWAN-SF Feature Engineering Job...")
    
    spark = SparkSession.builder \
        .appName("SWAN-SF-Feature-Engineering") \
        .config("spark.executor.memory", "4g") \
        .config("spark.driver.memory", "4g") \
        .getOrCreate()
        
    start_time = time.time()
    
    base_path = "file:///home/maaz/solar-flare-project/data"
    input_path = f"{base_path}/processed/partition1.parquet"
    output_path = f"{base_path}/features/partition1_features.parquet"
    
    print(f"Reading data from {input_path}")
    df = spark.read.parquet(input_path)
    
    # Cast timestamp to seconds for rangeBetween
    df = df.withColumn("ts_seconds", F.col("Timestamp").cast(LongType()))
    
    # Define a 12-hour rolling window (12 * 3600 = 43200 seconds)
    # Range is from 12 hours ago up to the current row
    twelve_hours_sec = 12 * 3600
    w_12h = Window.partitionBy("HARPNUM").orderBy("ts_seconds").rangeBetween(-twelve_hours_sec, 0)
    
    print("Applying rolling window functions...")
    # Calculate Mean, StdDev, and Slope
    df_features = df \
        .withColumn("USFLUX_12h_mean", F.mean("USFLUX").over(w_12h)) \
        .withColumn("USFLUX_12h_std", F.stddev("USFLUX").over(w_12h)) \
        .withColumn("USFLUX_12h_slope", (F.col("USFLUX") - F.first("USFLUX").over(w_12h)) / F.lit(12.0)) \
        .withColumn("R_VALUE_12h_mean", F.mean("R_VALUE").over(w_12h)) \
        .withColumn("R_VALUE_12h_std", F.stddev("R_VALUE").over(w_12h)) \
        .withColumn("R_VALUE_12h_slope", (F.col("R_VALUE") - F.first("R_VALUE").over(w_12h)) / F.lit(12.0))
    
    # Drop the temporary timestamp seconds column
    df_features = df_features.drop("ts_seconds")
    
    print(f"Writing features to {output_path}")
    df_features.write \
        .mode("overwrite") \
        .parquet(output_path)
    
    end_time = time.time()
    print(f"Feature engineering completed in {end_time - start_time:.2f} seconds.")
    
    spark.stop()

if __name__ == "__main__":
    main()
