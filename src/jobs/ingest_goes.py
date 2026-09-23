import os
import argparse
import logging
import asyncio
import aiohttp
from datetime import timedelta
import pandas as pd
from pyspark.sql import SparkSession
import pyspark.sql.functions as F
import h5netcdf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--swan_parquet", type=str, default="file:///home/maaz/solar-flare-project/data/features/partition1_features.parquet")
    parser.add_argument("--output_dir", type=str, default="file:///home/maaz/solar-flare-project/data/processed/goes_flux.parquet")
    return parser.parse_args()

def get_swan_timeframe(spark, swan_parquet_path):
    df = spark.read.parquet(swan_parquet_path)
    time_bounds = df.select(
        F.min("Timestamp").alias("min_ts"),
        F.max("Timestamp").alias("max_ts")
    ).collect()[0]
    return time_bounds["min_ts"], time_bounds["max_ts"]

async def download_file(session, url, dest):
    if os.path.exists(dest):
        return dest
    try:
        async with session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                with open(dest, 'wb') as f:
                    f.write(content)
                return dest
            else:
                return None
    except Exception as e:
        return None

async def download_goes_concurrently(start_time, end_time, data_dir="/home/maaz/sunpy/data"):
    os.makedirs(data_dir, exist_ok=True)
    
    # Generate list of daily URLs
    urls = []
    dests = []
    
    current = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    end = end_time.replace(hour=0, minute=0, second=0, microsecond=0)
    
    while current <= end:
        # e.g. https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/science/xrs/goes15/xrsf-l2-avg1m_science/2011/02/sci_xrsf-l2-avg1m_g15_d20110216_v2-2-1.nc
        year = current.strftime("%Y")
        month = current.strftime("%m")
        day_str = current.strftime("%Y%m%d")
        
        # Try both v2-2-1 and v2-2-0 just in case, but v2-2-1 is standard
        url = f"https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/science/xrs/goes15/xrsf-l2-avg1m_science/{year}/{month}/sci_xrsf-l2-avg1m_g15_d{day_str}_v2-2-1.nc"
        dest = os.path.join(data_dir, f"sci_xrsf-l2-avg1m_g15_d{day_str}.nc")
        
        urls.append(url)
        dests.append(dest)
        current += timedelta(days=1)
        
    logger.info(f"Generated {len(urls)} daily URLs to download.")
    
    downloaded_files = []
    
    # Run async downloads
    connector = aiohttp.TCPConnector(limit=20)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        for url, dest in zip(urls, dests):
            tasks.append(download_file(session, url, dest))
            
        results = await asyncio.gather(*tasks)
        
        for r in results:
            if r is not None:
                downloaded_files.append(r)
                
    logger.info(f"Successfully downloaded {len(downloaded_files)} files.")
    return downloaded_files

def parse_goes_netcdf(files):
    from sunpy import timeseries as ts
    logger.info("Loading into Sunpy TimeSeries...")
    if not files:
        return pd.DataFrame()
        
    dfs = []
    # Process in chunks to avoid memory spikes
    chunk_size = 50
    for i in range(0, len(files), chunk_size):
        chunk_files = files[i:i+chunk_size]
        try:
            ts_chunk = ts.TimeSeries(chunk_files)
            if not isinstance(ts_chunk, list):
                ts_chunk = [ts_chunk]
                
            for t in ts_chunk:
                dfs.append(t.to_dataframe())
        except Exception as e:
            logger.error(f"Error parsing chunk: {e}")
            
    if dfs:
        final_df = pd.concat(dfs).sort_index()
        cols_to_keep = ['xrsa', 'xrsb', 'xrsa_quality', 'xrsb_quality']
        existing_cols = [c for c in cols_to_keep if c in final_df.columns]
        final_df = final_df[existing_cols]
        final_df = final_df.reset_index().rename(columns={'index': 'GOES_Timestamp'})
        # Drop duplicates just in case
        final_df = final_df.drop_duplicates(subset=['GOES_Timestamp'])
        return final_df
    return pd.DataFrame()

def main():
    args = parse_args()
    
    spark = SparkSession.builder \
        .appName("Ingest GOES (Fast Async)") \
        .master("local[*]") \
        .getOrCreate()
        
    logger.info(f"Reading SWAN data from {args.swan_parquet}")
    start_time, end_time = get_swan_timeframe(spark, args.swan_parquet)
    
    # We need 24h of data before the first SWAN timestamp to calculate the first 24h rolling max
    start_time = start_time - timedelta(days=1)
    
    logger.info(f"GOES Timeframe: {start_time} to {end_time}")
    
    # Download files async
    files = asyncio.run(download_goes_concurrently(start_time, end_time))
    
    df = parse_goes_netcdf(files)
    
    if df.empty:
        logger.error("No GOES data processed!")
        return
        
    logger.info(f"Processed GOES DataFrame with {len(df)} rows.")
    
    logger.info(f"Saving to {args.output_dir}")
    spark_df = spark.createDataFrame(df)
    spark_df = spark_df.withColumn("GOES_Timestamp", F.to_timestamp("GOES_Timestamp"))
    spark_df.write.mode("overwrite").parquet(args.output_dir)
    logger.info("Ingestion complete.")
    
    spark.stop()

if __name__ == "__main__":
    main()
