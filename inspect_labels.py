import pyspark.sql.functions as F
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('Inspect Labels').master('local[*]').getOrCreate()
df = spark.read.parquet('file:///home/maaz/solar-flare-project/data/features/partition1_final.parquet')

df.groupBy('label', 'MFLARE', 'XFLARE').count().orderBy('label', 'MFLARE', 'XFLARE').show(20, truncate=False)

print('Unique values in label:')
df.select('label').distinct().show()
print('Unique values in MFLARE:')
df.select('MFLARE').distinct().show()
print('Unique values in XFLARE:')
df.select('XFLARE').distinct().show()

spark.stop()
