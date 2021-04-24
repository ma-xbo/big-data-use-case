const express = require("express");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

// Zurückgeben aller Ergebnisse
router.get("/getList", (req, res) => {
  console.log("Request: " + "Method=" + req.method + ", URL=" + req.originalUrl);

  const list = ["item1", "item2", "item3"];
  res.json(list);

  console.log("Response: " + "Status=" + res.statusCode);
});

module.exports = router;
