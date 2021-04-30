const express = require("express");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Dummy Daten
// ------------------------------------------------------------

const orders = [
  {
    order_id: "3453715c-ad43-4611-bc49-988f34386c9d",
    dish_name: "Hackfleischröllchen mit Djuvec-Reis und Salat",
    dish_price: 12.9,
    store_name: "Five Rivers Restaurant",
    store_area: "Zone1",
    store_lat: 52.52168860493468,
    store_lon: 13.384807813113612,
    timestamp: new Date(),
  },
  {
    order_id: "61574fa7-ff46-4078-af3a-8228f0a294b7",
    dish_name: "Hackfleischröllchen mit Djuvec-Reis und Salat",
    dish_price: 12.9,
    store_name: "Five Rivers Restaurant",
    store_area: "Zone1",
    store_lat: 52.52168860493468,
    store_lon: 13.384807813113612,
    timestamp: new Date(),
  },
  {
    order_id: "c17ff68f-42b4-407f-a64d-e7883ce0dfa9",
    dish_name: "Eisbein mit Sauerkraut, Salzkartoffeln und Erbspürree mit Speck",
    dish_price: 13.9,
    store_name: "Best Worscht",
    store_area: "Zone1",
    store_lat: 52.510491388069475,
    store_lon: 13.380505155941325,
    timestamp: new Date(),
  },
  {
    order_id: "1b6d06b4-ec20-4b19-96ee-67d934656b56",
    dish_name: "Meeresfrüchtesalat mit Chili und Thai-Kräutem",
    dish_price: 11.6,
    store_name: "Restaurant Facil",
    store_area: "Zone2",
    store_lat: 52.509029388326915,
    store_lon: 13.373680166244354,
    timestamp: new Date(),
  },
];

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Zurückgeben aller Bestellungen
router.get("/orders", (req, res) => {
  //TODO: Daten aus Datenbank darstellen
  //Datenbankabfrage

  //Zurückgeben der Dummy-Daten
  res.json(orders);

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

// Zurückgeben einer bestimmten Bestellung
router.get("/orders/:order_id", (req, res) => {
  const orderId = req.params.order_id;

  for (let index = 0; index < orders.length; index++) {
    if (orders[index].order_id === orderId) {
      console.log(orders[index]);
      res.json(orders[index]);
    }
  }

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

module.exports = router;
