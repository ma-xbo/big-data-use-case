from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType
import mysqlx

dbOptions = {"host": "my-app-mysql-service", 'port': 33060, "user": "root", "password": "mysecretpw"}
dbSchema = 'popular'
windowDuration = '5 minutes'
slidingDuration = '1 minute'

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Structured Streaming").getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Example Part 2
# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers",
            "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "tracking-data") \
    .option("startingOffsets", "earliest") \
    .load()

# TODO: Check that subscription topic-name is still correct

# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("dish_name", StringType()) \
    .add("store_name", StringType()) \
    .add("dish_price", FloatType()) \
    .add("timestamp", IntegerType())

# TODO: Check schema when finalized in data-generator


# Example Part 3
# Convert value: binary -> JSON -> fields + parsed timestamp
trackingMessages = kafkaMessages.select(
    # Extract 'value' from Kafka message (i.e., the tracking data)
    from_json(
        column("value").cast("string"),
        trackingMessageSchema
    ).alias("json")
).select(
    # Convert Unix timestamp to TimestampType
    from_unixtime(column('json.timestamp'))
    .cast(TimestampType())
    .alias("parsed_timestamp"),

    # Select all JSON fields
    column("json.*")
) \
    .withColumnRenamed('json.dish_name', 'dish_name') \
    .withColumnRenamed('json.store_name', 'store_name') \
    .withColumnRenamed('json.dish_price', 'dish_price') \
    .withWatermark("parsed_timestamp", windowDuration)

# TODO: Check schema when finalized in data-generator

# Example Part 4
# Compute most popular dishes by count
dish_count = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("dish_name")
).count().withColumnRenamed('count', 'dish_orders')

# Compute most popular dishes by revenue
dish_revenue = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("dish_name")
).sum("dish_price").withColumnRenamed('sum', 'dish_revenue')

# Compute most popular stores by count
store_count = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("stored_name")
).count().withColumnRenamed('count', 'store_orders')

# Compute most popular stores by revenue
store_revenue = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("store_name")
    ).sum("dish_price").withColumnRenamed('count', 'store_revenue')

# TODO: implement double agg. on both stores and dishes?

# Example Part 5
# Start running the query; print running counts to the console
consoleDump = dish_count \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = dish_revenue\
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = store_count
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = store_revenue
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

# Example Part 6
def saveToDatabase(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute() # TODO: Make sure schema name is still correct

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT INTO popular " # TODO: Decide on table structure and jtherefore results layout: Seperate views for revenue and count or both in one with order-by in html?
                              "(mission, count) VALUES (?, ?) "
                              "ON DUPLICATE KEY UPDATE count=?")
            sql.bind(row.mission, row.views, row.views).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db)

# Example Part 7
dbInsertStream = popular.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
