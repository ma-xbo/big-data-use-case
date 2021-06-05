const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { Kafka } = require("kafkajs");

// Erstellen einer Express Router Instanz
const router = express.Router();

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
    const selectedDishIndex = Math.floor(Math.random() * dishes.length);
    const dishId = dishes[selectedDishIndex].dish_id;
    const dishName = dishes[selectedDishIndex].dish_name;
    const dishPrice = dishes[selectedDishIndex].dish_price;
    const selectedStoreIndex = Math.floor(Math.random() * stores.length);
    const storeId = stores[Math.floor(selectedStoreIndex)].store_id;
    const storeName = stores[Math.floor(selectedStoreIndex)].store_name;

    const date = new Date();
    const timestamp_kafka = Math.floor(date / 1000); // Format für Kafka

    const order_kafka = {
      order_id: orderId,
      dish_id: dishId,
      store_id: storeId,
      price: parseInt(dishPrice * 100), // Preis wird in Cent übertragen
      timestamp: timestamp_kafka,
    };

    // Senden der Tracking-Nachricht an Kafka
    sendTrackingMessage(order_kafka)
      .then(() => {
        console.log("Sent new order to kafka");
      })
      .catch((e) => {
        console.log("Error sending to kafka", e);
        res.sendStatus(500);
      });

    const orderData = {
      order_id: orderId,
      dish_name: dishName,
      store_name: storeName,
      timestamp: timestamp_kafka,
    };

    const webSocketServer = req.app.locals.ws;
    webSocketServer.send(JSON.stringify(orderData));

    // Zurückgeben der erstellten Bestellung
    res.send(orderData);
  } catch (error) {
    console.log(error);
    res.sendStatus(error);
    throw new Error("BROKEN");
  }

  console.log("Request: Method=" + req.method + ", URL=" + req.originalUrl + "; Response: Status=" + res.statusCode);
});

module.exports = router;
