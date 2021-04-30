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
  const stores = (await axios.get("http://localhost:3000/api/masterdata/stores")).data;
  const dishes = (await axios.get("http://localhost:3000/api/masterdata/dishes")).data;

  const order = {
    order_id: uuidv4(),
    store_id: stores[Math.floor(Math.random() * stores.length)].store_id,
    dish_id: dishes[Math.floor(Math.random() * dishes.length)].dish_id,
    timestamp: new Date().toISOString(),
  };

  res.send(order);

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

// Temporär zum Erstellen einer Kafka Meldung
router.get("/addorderkafka", async (req, res) => {
  const stores = (await axios.get("http://localhost:3000/api/masterdata/stores")).data;
  const dishes = (await axios.get("http://localhost:3000/api/masterdata/dishes")).data;

  const order = {
    order_id: uuidv4(),
    store_id: stores[Math.floor(Math.random() * stores.length)].store_id,
    dish_id: dishes[Math.floor(Math.random() * dishes.length)].dish_id,
    timestamp: new Date().toISOString(),
  };

  // Send the tracking message to Kafka
  sendTrackingMessage(
	  order
    )
    .then(() => {
      console.log("Sent to kafka");
      res.send(order);
    })
    .catch((e) => {
      console.log("Error sending to kafka", e);
      res.sendStatus(500);
    });

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

module.exports = router;
