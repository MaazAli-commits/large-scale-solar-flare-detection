import argparse
from pyspark.sql import SparkSession
from pyspark.sql.functions import lit
from pyspark.sql.types import IntegerType
import time

def main():
    parser = argparse.ArgumentParser(description="Ingest SWAN-SF CSV partitions into Parquet")
    parser.add_argument("--partition", type=str, required=True, help="Partition to process, e.g., 'partition2'")
    args = parser.parse_args()
    
    print(f"Starting SWAN-SF Ingestion Job for {args.partition}...")
    
    # Initialize SparkSession
    spark = SparkSession.builder \
        .appName(f"SWAN-SF-Ingestion-{args.partition}") \
        .config("spark.executor.memory", "4g") \
        .config("spark.driver.memory", "4g") \
        .getOrCreate()
        
    start_time = time.time()
    
    base_path = "file:///home/maaz/solar-flare-project/data"
    
    # Paths (We use *.csv to automatically ignore :Zone.Identifier files)
    fl_path = f"{base_path}/raw/{args.partition}/FL/*.csv"
    nf_path = f"{base_path}/raw/{args.partition}/NF/*.csv"
    output_path = f"{base_path}/processed/{args.partition}.parquet"
    
    print(f"Reading FL data from {fl_path}")
    # Read Flare Data (Positive Class)
    df_fl = spark.read \
        .option("sep", "\t") \
        .option("header", "true") \
        .option("inferSchema", "true") \
        .csv(fl_path)
    
    import pyspark.sql.functions as F
    df_fl = df_fl.withColumn("filename", F.input_file_name()) \
                 .withColumn("HARPNUM", F.regexp_extract("filename", r"@(\d+)_", 1).cast(IntegerType())) \
                 .withColumn("label", lit(1).cast(IntegerType()))
    
    print(f"Reading NF data from {nf_path}")
    # Read No Flare Data (Negative Class)
    df_nf = spark.read \
        .option("sep", "\t") \
        .option("header", "true") \
        .option("inferSchema", "true") \
        .csv(nf_path)
    
    df_nf = df_nf.withColumn("filename", F.input_file_name()) \
                 .withColumn("HARPNUM", F.regexp_extract("filename", r"@(\d+)_", 1).cast(IntegerType())) \
                 .withColumn("label", lit(0).cast(IntegerType()))
    
    print("Unioning dataframes...")
    # Combine the dataframes
    df_combined = df_fl.unionByName(df_nf)
    
    print(f"Writing parquet output to {output_path}")
    # Write to processed directory as Parquet
    df_combined.write \
        .mode("overwrite") \
        .parquet(output_path)
    
    end_time = time.time()
    print(f"Ingestion completed in {end_time - start_time:.2f} seconds.")
    
    print("Verifying Output...")
    df_verify = spark.read.parquet(output_path)
    total_count = df_verify.count()
    print(f"Total Records: {total_count}")
    
    # Group by label to see class distribution
    distribution = df_verify.groupBy("label").count().collect()
    for row in distribution:
        print(f"Label {row['label']}: {row['count']} records ({(row['count'] / total_count) * 100:.2f}%)")
        
    spark.stop()

if __name__ == "__main__":
    main()
