const express = require("express");
const axios = require("axios");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Generator Funktionalität
// ------------------------------------------------------------

const initialEventsPerMinute = 30;
let sleepTimeMilliseconds = (60 / initialEventsPerMinute) * 1000;
let timer = null;

async function randomData() {
  const data = (await axios.get("http://localhost:3000/api/orders/addorder")).data;
  console.log(data);
}

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Starten des Data Generator
router.get("/start", (req, res) => {
  timer = setInterval(randomData, sleepTimeMilliseconds);
  res.send("Starting to generate data");
});

// Stoppen des Data Generator
router.get("/stop", (req, res) => {
  clearInterval(timer);
  timer = null;
  res.send("Stopping to generate data");
});

// Ausgeben des Status des Data Generator
router.get("/status", (req, res) => {
  const statusObj = {
    running: timer ? true : false,
  };
  res.send(statusObj);
});

// Ausgeben des Konfiguration des Data Generator
router.get("/config", (req, res) => {
  const configObj = {
    sleepTimeMilliseconds: sleepTimeMilliseconds,
  };
  res.send(configObj);
});

// Ändern der Konfiguration des Data Generator
router.post("/config", function (req, res) {
  console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

  if (timer === null) {
    // Anpassen der Einstellung
    const eventsPerMinute = req.body.eventsPerMinute;
    sleepTimeMilliseconds = (60 / eventsPerMinute) * 1000;
    res.sendStatus(200);
  } else if (timer != null) {
    res.sendStatus(401);
  }
});

module.exports = router;
