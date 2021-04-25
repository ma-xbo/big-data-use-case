const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { Kafka } = require("kafkajs");
const app = express();
const port = 3000;

/* const dataStructure = {
  ID: "9d451283-9e83-48eb-9c29-e7411f81eaf5",
  timestamp: new Date(),
  latitude: 51.494449497662984,
  longitude: -0.17357715798513457,
};
 */

function randLatitude() {
  //latitude coordinate must be between -90 and 90
  const max = 90;
  const min = -90;
  return (Math.random() * (max - min + 1) + min).toFixed(4);
}

function randLongitude() {
  // longitude coordinate must be between -180 and 180
  const max = 180;
  const min = -180;
  return (Math.random() * (max - min + 1) + min).toFixed(4);
}

function randData() {
  const dataObject = {
    ID: uuidv4(),
    timestamp: new Date().toISOString(),
    latitude: randLatitude(),
    longitude: randLongitude(),
  };
  console.log(dataObject);
}

// ----------------------------------------------------
/* Express App */

const initialEventsPerMinute = 30;
let sleepTimeMilliseconds = (60 / initialEventsPerMinute) * 1000;
let timer = null;

app.use(express.json());

// Bereitstellen der statischen Dateien (HTML, CSS, JS), die für die Darstellung der Webseite genutzt werden
app.use("/", express.static("www"));
app.use("/lib", express.static("node_modules"));

// Bereitstellen der Router
app.get("/api/start", (req, res) => {
  timer = setInterval(randData, sleepTimeMilliseconds);
  res.send("Starting to generate data");
});

app.get("/api/stop", (req, res) => {
  clearInterval(timer);
  timer = null;
  res.send("Stopping to generate data");
});

app.get("/api/config", (req, res) => {
  const configObj = {
    running: timer ? true : false,
    sleepTimeMilliseconds: sleepTimeMilliseconds,
  };
  res.send(configObj);
});

app.post("/api/config", function (req, res) {
  console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

  if (timer === null) {
    const eventsPerMinute = req.body.eventsPerMinute;
    sleepTimeMilliseconds = (60 / eventsPerMinute) * 1000;

    res.sendStatus(200);
  } else if (timer != null) {
    res.sendStatus(401);
  }
});

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

// Starten der App
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
