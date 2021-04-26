const express = require("express");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

router.get("/orders", (req, res) => {
  console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

  const orders = [
    {
      order_id: "1b6d06b4-ec20-4b19-96ee-67d934656b56",
      dish_name: "Test1",
      dish_price: 49,
      store_name: "Sushi Store",
      store_location: { lat: "77.1423", lon: "73.1177" },
      timestamp: new Date(),
    },
    {
      order_id: "c17ff68f-42b4-407f-a64d-e7883ce0dfa9",
      dish_name: "Test2",
      dish_price: 10,
      store_name: "Sushi Store",
      store_location: { lat: "77.1423", lon: "73.1177" },
      timestamp: new Date(),
    },
    {
      order_id: "3453715c-ad43-4611-bc49-988f34386c9d",
      dish_name: "Test3",
      dish_price: 20,
      store_name: "Schnitzel Restaurant",
      store_location: { lat: "55.1423", lon: "13.1177" },
      timestamp: new Date(),
    },
  ];

  res.json(orders);

  console.log("Response: " + "Status=" + res.statusCode);
});

// Zurückgeben aller Ergebnisse
router.get("/getList", (req, res) => {
  console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

  const list = ["item1", "item2", "item3"];
  res.json(list);

  console.log("Response: " + "Status=" + res.statusCode);
});

module.exports = router;
