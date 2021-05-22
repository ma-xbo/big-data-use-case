const express = require("express");
const axios = require("axios");
const mysqlx = require("@mysql/xdevapi");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { Kafka } = require("kafkajs");

// Erstellen einer Express Router Instanz
const router = express.Router();

// -------------------------------------------------------
// Database Configuration
// -------------------------------------------------------

const dbSessionConfig = {
  host: "my-app-mysql-service",
  port: "33060",
  user: "root",
  password: "mysecretpw",
};

const dbConfig = {
  host: "my-app-mysql-service", //'localhost',
  port: "33060",
  user: "root",
  password: "mysecretpw",
  schema: "popular",
};

// ------------------------------------------------------------
// Kafka Setup
// ------------------------------------------------------------

const kafka = new Kafka({
  clientId: "tracker-" + Math.floor(Math.random() * 100000),
  brokers: ["my-cluster-kafka-bootstrap:9092"],
  retry: {
    retries: 0,
  },
});

const producer = kafka.producer();

// Send tracking message to Kafka
async function sendTrackingMessage(data) {
  //Ensure the producer is connected
  await producer.connect();

  //Send message
  await producer.send({
    topic: "tracking-data",
    messages: [{ value: JSON.stringify(data) }],
  });
}

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Erstellen eines neuen Events (wird von Data Generator Service aufgerufen)
router.get("/addorder", async (req, res) => {
  try {
    const dishes = (await axios.get("http://localhost:3000/api/masterdata/dishes")).data.dishes;
    const stores = (await axios.get("http://localhost:3000/api/masterdata/stores")).data.stores;

    const orderId = uuidv4();
    const dishId = dishes[Math.floor(Math.random() * dishes.length)].dish_id;
    const storeId = stores[Math.floor(Math.random() * stores.length)].store_id;

    const date = new Date();
    const timestamp_mysql = moment(date).format("YYYY-MM-DD  HH:mm:ss.000"); // Format für MySQL Datetime
    const timestamp_kafka = Math.floor(date / 1000); // Format für Kafka

    const order_mysql = {
      order_id: orderId,
      dish_id: dishId,
      store_id: storeId,
      timestamp: timestamp_mysql,
    };

    const order_kafka = {
      order_id: orderId,
      dish_id: dishId,
      store_id: storeId,
      price: 100,
      timestamp: timestamp_kafka,
    };

    //TODO -> Das Hinzufügen der Order in die DB über den Data Generator wird später entfernt
    //     -> Die Funktion wird später von Kafka/Spark übernommen
    // Hinzufügen der Bestellung in die orders Tabelle der Datenbank
    /*     mysqlx.getSession(dbSessionConfig).then(function (session) {
      // Zugriff auf die Orders-Tabelle
      ordersTable = session.getSchema("popular").getTable("orders");

      // Einfügen der Daten in die Orders-Tabelle
      return ordersTable
        .insert(["order_id", "dish_id", "store_id", "timestamp"])
        .values([order_mysql.order_id, order_mysql.dish_id, order_mysql.store_id, order_mysql.timestamp])
        .execute();
    }); */

    // Senden der Tracking-Nachricht an Kafka
    sendTrackingMessage(order_kafka)
      .then(() => {
        console.log("Sent new order to kafka");
      })
      .catch((e) => {
        console.log("Error sending to kafka", e);
        res.sendStatus(500);
      });

    // Zurückgeben der erstellten Bestellung
    res.send(order_mysql);
  } catch (error) {
    console.log(error);
    res.sendStatus(error);
    throw new Error("BROKEN");
  }

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

module.exports = router;
