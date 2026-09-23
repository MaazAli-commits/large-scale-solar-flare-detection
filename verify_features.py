from pyspark.sql import SparkSession
import pyspark.sql.functions as F

spark = SparkSession.builder.appName('VerifyFeatures').config('spark.driver.memory', '2g').getOrCreate()

print("Reading features dataset...")
df = spark.read.parquet('file:///home/maaz/solar-flare-project/data/features/partition1_features.parquet')

print("Total Records with Features:", df.count())

print("Checking sample for HARPNUM 1235...")
df.filter(F.col("HARPNUM") == 1235).select(
    "Timestamp", "HARPNUM", "USFLUX", 
    F.round("USFLUX_12h_mean", 4).alias("mean_12h"),
    F.round("USFLUX_12h_std", 4).alias("std_12h"),
    F.round("USFLUX_12h_slope", 4).alias("slope_12h")
).orderBy("Timestamp").show(20, truncate=False)

spark.stop()
