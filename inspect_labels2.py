import pyspark.sql.functions as F
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('Inspect Labels 2').master('local[*]').getOrCreate()
df = spark.read.parquet('file:///home/maaz/solar-flare-project/data/features/partition1_final.parquet')

df.groupBy('label', 'MFLARE', 'XFLARE', 'CFLARE', 'BFLARE').count().orderBy('label', 'XFLARE', 'MFLARE', 'CFLARE', 'BFLARE').show(100, truncate=False)

spark.stop()
