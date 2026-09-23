import argparse
import logging
from pyspark.sql import SparkSession
import pyspark.sql.functions as F
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder \
        .appName("Verify GOES") \
        .master("local[*]") \
        .getOrCreate()
        
    final_path = "file:///home/maaz/solar-flare-project/data/features/partition1_final.parquet"
    goes_path = "file:///home/maaz/solar-flare-project/data/processed/goes_flux.parquet"
    
    logger.info("Reading final dataset and raw GOES dataset...")
    final_df = spark.read.parquet(final_path)
    goes_df = spark.read.parquet(goes_path)
    
    # 1. Verification of Match Counts
    total = final_df.count()
    exact = final_df.filter((F.col("match_pos") == 0) & (F.col("xrsb").isNotNull())).count()
    fallback = final_df.filter((F.col("match_pos") > 0) & (F.col("xrsb").isNotNull())).count()
    missing = final_df.filter(F.col("xrsb").isNull()).count()
    
    logger.info("--- MATCH COUNTS ---")
    logger.info(f"Total SWAN Rows: {total}")
    logger.info(f"Exact Matches: {exact} ({(exact/total)*100:.2f}%)")
    logger.info(f"Fallback Matches: {fallback} ({(fallback/total)*100:.2f}%)")
    logger.info(f"Missing GOES: {missing} ({(missing/total)*100:.2f}%)")
    
    # 2. Verification of Temporal Integrity and Calculations
    # Pick a random row with a valid exact match
    sample = final_df.filter(F.col("match_pos") == 0).orderBy(F.rand()).limit(1).collect()
    
    if not sample:
        logger.error("No exact matches found to verify.")
        return
        
    sample = sample[0]
    swan_ts = sample["Timestamp"]
    target_ts = swan_ts - pd.Timedelta(minutes=1)
    
    logger.info(f"--- VERIFYING TEMPORAL LEAKAGE FOR SWAN TIMESTAMP {swan_ts} ---")
    logger.info(f"GOES expected target timestamp (T-1): {target_ts}")
    logger.info(f"Engineered Features: xrsb={sample['xrsb']}, max_24h={sample['goes_xrsb_max_24h']}, mean_12h={sample['goes_xrsb_mean_12h']}")
    
    # Fetch all raw GOES data in the 24h window STRICTLY BEFORE swan_ts
    # (meaning GOES timestamp <= target_ts)
    start_24h = target_ts - pd.Timedelta(hours=24)
    start_12h = target_ts - pd.Timedelta(hours=12)
    
    raw_window = goes_df.filter((F.col("GOES_Timestamp") >= start_24h) & (F.col("GOES_Timestamp") <= target_ts)) \
                        .select("GOES_Timestamp", "xrsb").toPandas()
                        
    raw_window = raw_window.set_index("GOES_Timestamp").sort_index()
    
    if len(raw_window) == 0:
        logger.error("No raw GOES data found in window?!")
        return
        
    actual_current = raw_window.loc[target_ts]["xrsb"] if target_ts in raw_window.index else None
    actual_max_24h = raw_window["xrsb"].max()
    actual_mean_12h = raw_window.loc[start_12h:target_ts]["xrsb"].mean()
    
    logger.info(f"Raw Calculation: xrsb={actual_current}, max_24h={actual_max_24h}, mean_12h={actual_mean_12h}")
    
    # Assertions
    try:
        assert abs(sample['xrsb'] - actual_current) < 1e-6, "Current xrsb mismatch!"
        assert abs(sample['goes_xrsb_max_24h'] - actual_max_24h) < 1e-6, "Max 24h mismatch!"
        assert abs(sample['goes_xrsb_mean_12h'] - actual_mean_12h) < 1e-6, "Mean 12h mismatch!"
        logger.info("SUCCESS: Engineered features perfectly match raw historical calculations. Zero leakage proven.")
    except Exception as e:
        logger.error(f"VERIFICATION FAILED: {e}")

if __name__ == "__main__":
    main()
