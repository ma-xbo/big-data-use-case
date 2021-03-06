from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType
import mysqlx
import logging as log
from datetime import datetime

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

# Example Part 2+3
# Helper function for tranforming multiple read-streams
def getMessages():
    tmp_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers",
            "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "tracking-data") \
    .option("startingOffsets", "earliest") \
    .load()
    return tmp_stream.select(
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
    .withColumnRenamed('json.dish_id', 'dish_id') \
    .withColumnRenamed('json.store_id', 'store_id') \
    .withColumnRenamed('json.order_id', 'order_id') \
    .withColumnRenamed('json.price', 'price') \
    .withWatermark("parsed_timestamp", windowDuration)

# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("dish_id", StringType()) \
    .add("store_id", StringType()) \
    .add("order_id", StringType()) \
    .add("price", IntegerType()) \
    .add("timestamp", IntegerType())

# Read messages from Kafka
trackingMessages_0 = getMessages()
trackingMessages_1 = getMessages()
trackingMessages_2 = getMessages()
trackingMessages_3 = getMessages()
trackingMessages_4 = getMessages()

# Example Part 4
# Compute most popular dishes by count
dish_count = trackingMessages_0.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("dish_id")
).count().withColumnRenamed('count', 'dish_orders')

# Compute most popular dishes by revenue
dish_revenue = trackingMessages_1.groupBy(
   window(
       column("parsed_timestamp"),
       windowDuration,
       slidingDuration
   ),
   column("dish_id")
).sum("price").withColumnRenamed('sum(price)', 'dish_revenue')

# Compute most popular stores by count
store_count = trackingMessages_2.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("store_id")
).count().withColumnRenamed('count', 'store_orders')

# Compute most popular stores by revenue
store_revenue = trackingMessages_3.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("store_id")
).sum("price").withColumnRenamed('sum(price)', 'store_revenue')

# Example Part 5
# Start running the query; print running counts to the console
consoleDump = trackingMessages_0 \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = dish_revenue \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = dish_count \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = store_revenue \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

consoleDump = store_count \
    .writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .format("console") \
    .option("truncate", "false") \
    .start()

# Example Part 6
def saveToDatabase_dish_count(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db_dish_count(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT INTO count_dish "
                              "(dish_id, count) VALUES (?, ?) "
                              "ON DUPLICATE KEY UPDATE count=?")
            sql.bind(row.dish_id, row.dish_orders, row.dish_orders).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db_dish_count)

def saveToDatabase_dish_revenue(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db_dish_revenue(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT INTO revenue_dish "
                              "(dish_id, revenue) VALUES (?, ?) "
                              "ON DUPLICATE KEY UPDATE revenue=?")
            sql.bind(row.dish_id, row.dish_revenue, row.dish_revenue).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db_dish_revenue)

def saveToDatabase_store_count(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db_store_count(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT INTO count_store "
                              "(store_id, count) VALUES (?, ?) "
                              "ON DUPLICATE KEY UPDATE count=?")
            sql.bind(row.store_id, row.store_orders, row.store_orders).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db_store_count)

def saveToDatabase_store_revenue(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db_store_revenue(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT INTO revenue_store "
                              "(store_id, revenue) VALUES (?, ?) "
                              "ON DUPLICATE KEY UPDATE revenue=?")
            sql.bind(row.store_id, row.store_revenue, row.store_revenue).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db_store_revenue)

def saveToDatabase_rawOrders(batchDataframe, batchId):
    # Define function to save a dataframe to mysql
    def save_to_db_rawOrders(iterator):
        # Connect to database and use schema
        session = mysqlx.get_session(dbOptions)
        session.sql("USE popular").execute()

        for row in iterator:
            # Run upsert (insert or update existing)
            sql = session.sql("INSERT IGNORE INTO orders "
                              "(order_id, dish_id, store_id, timestamp) VALUES (?, ?, ?, ?)")
            parsed_timestamp = datetime.utcfromtimestamp(row.timestamp).strftime('%Y-%m-%d %H:%M:%S')
            sql.bind(row.order_id, row.dish_id, row.store_id, parsed_timestamp).execute()

        session.close()

    # Perform batch UPSERTS per data partition
    batchDataframe.foreachPartition(save_to_db_rawOrders)

# Example Part 7
dbInsertStream = dish_count.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase_dish_count) \
    .start()

dbInsertStream = dish_revenue.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase_dish_revenue) \
    .start()

dbInsertStream = store_count.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase_store_count) \
    .start()

dbInsertStream = store_revenue.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase_store_revenue) \
    .start()

dbInsertStream = trackingMessages_4.writeStream \
    .trigger(processingTime=slidingDuration) \
    .outputMode("update") \
    .foreachBatch(saveToDatabase_rawOrders) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
