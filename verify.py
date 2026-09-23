from pyspark.sql import SparkSession
spark = SparkSession.builder.appName('Verify').config('spark.driver.memory', '2g').getOrCreate()
df = spark.read.parquet('file:///home/maaz/solar-flare-project/data/processed/partition1.parquet')
print('Total Records:', df.count())
df.groupBy('label').count().show()
spark.stop()
