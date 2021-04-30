const express = require("express");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Datenbank Initialisierung
// ------------------------------------------------------------

// Dummy

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Ausgeben der in der Datenbank vorhandenen Gerichte
router.get("/dishes", (req, res) => {
  //TODO: Daten aus DB auslesen
  //Alternativ werden aktuell Dummy Daten genutzt
  const dummyDishes = [
    {
      dish_id: "61579f07-ff46-4078-af3a-8228f0a294b7",
      dish_name: "Hackfleischröllchen mit Djuvec-Reis und Salat",
      dish_price: 12.9,
    },
    {
      dish_id: "535bac21-27dd-4ed2-b28b-5c643556f4ba",
      dish_name: "Eisbein mit Sauerkraut, Salzkartoffeln und Erbspürree mit Speck",
      dish_price: 13.9,
    },
    {
      dish_id: "38adb785-246b-4efe-94e9-d194fa8c4978",
      dish_name: "Meeresfrüchtesalat mit Chili und Thai-Kräutem",
      dish_price: 11.6,
    },
  ];

  res.send(dummyDishes);

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

// Ausgeben der in der Datenbank vorhandenen Restaurants
router.get("/stores", (req, res) => {
  //TODO: Daten aus DB auslesen
  //Alternativ werden aktuell Dummy Daten genutzt
  const dummyStores = [
    {
      store_id: "61579f27-ff46-40a8-af3a-8228f0a294b7",
      store_name: "Five Rivers Restaurant",
      store_area: "Zone1",
      store_lat: 52.52168860493468,
      store_lon: 13.384807813113612,
    },
    {
      store_id: "61529f27-ff46-40a8-af3a-8228f0a294b7",
      store_name: "Best Worscht",
      store_area: "Zone1",
      store_lat: 52.510491388069475,
      store_lon: 13.380505155941325,
    },
    {
      store_id: "61529f21-ff46-40a8-af3a-8228f0a294b7",
      store_name: "Restaurant Facil",
      store_area: "Zone2",
      store_lat: 52.509029388326915,
      store_lon: 13.373680166244354,
    },
  ];

  res.send(dummyStores);

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

module.exports = router;
