const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { Kafka } = require("kafkajs");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Starten des Data Generator
router.get("/addorder", async (req, res) => {
  console.log("Request: Method=" + req.method + ", URL=" + req.originalUrl);

  const stores = (await axios.get("http://localhost:3000/api/masterdata/stores")).data;
  const dishes = (await axios.get("http://localhost:3000/api/masterdata/dishes")).data;

  const order = {
    order_id: uuidv4(),
    store_id: stores[Math.floor(Math.random() * stores.length)].store_id,
    dish_id: dishes[Math.floor(Math.random() * dishes.length)].dish_id,
    timestamp: new Date().toISOString(),
  };

  res.send(order);
});

module.exports = router;

/* 
{
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

  app.get("/api/sendkafka", (req, res) => {
    console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

    const dummy_order_ids = [
      "61579f07-ff46-4078-af3a-8228f0a294b7",
      "535bac21-27dd-4ed2-b28b-5c643556f4ba",
      "38adb785-246b-4efe-94e9-d194fa8c4978",
    ];
    const random_index = Math.floor(Math.random() * dummy_order_ids.length);

    // Send the tracking message to Kafka
    sendTrackingMessage({
      order_id: dummy_order_ids[random_index],
      timestamp: Math.floor(new Date() / 1000),
    })
      .then(() => {
        console.log("Sent to kafka");
        res.sendStatus(200);
      })
      .catch((e) => {
        console.log("Error sending to kafka", e);
        res.sendStatus(200);
      });

    console.log("Response: " + "Status=" + res.statusCode);
  });
}
 */
