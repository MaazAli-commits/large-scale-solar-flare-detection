import pyspark.sql.functions as F
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('Verify Counts').master('local[*]').getOrCreate()
df = spark.read.parquet('file:///home/maaz/solar-flare-project/data/features/partition1_final.parquet')
print('----- PARTITION1 FINAL PARQUET -----')
df.groupBy('label').count().show()

df_raw = spark.read.parquet('file:///home/maaz/solar-flare-project/data/processed/partition1.parquet')
print('----- RAW PARTITION1 PARQUET -----')
df_raw.groupBy('label').count().show()

spark.stop()
