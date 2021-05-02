const express = require("express");
const mysqlx = require("@mysql/xdevapi");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Dummy Daten
// ------------------------------------------------------------

// const orders = [
//   {
//     order_id: "3453715c-ad43-4611-bc49-988f34386c9d",
//     dish_name: "Hackfleischröllchen mit Djuvec-Reis und Salat",
//     dish_price: 12.9,
//     store_name: "Five Rivers Restaurant",
//     store_area: "Zone1",
//     store_lat: 52.52168860493468,
//     store_lon: 13.384807813113612,
//     timestamp: new Date(),
//   },
//   {
//     order_id: "61574fa7-ff46-4078-af3a-8228f0a294b7",
//     dish_name: "Hackfleischröllchen mit Djuvec-Reis und Salat",
//     dish_price: 12.9,
//     store_name: "Five Rivers Restaurant",
//     store_area: "Zone1",
//     store_lat: 52.52168860493468,
//     store_lon: 13.384807813113612,
//     timestamp: new Date(),
//   },
//   {
//     order_id: "c17ff68f-42b4-407f-a64d-e7883ce0dfa9",
//     dish_name: "Eisbein mit Sauerkraut, Salzkartoffeln und Erbspürree mit Speck",
//     dish_price: 13.9,
//     store_name: "Best Worscht",
//     store_area: "Zone1",
//     store_lat: 52.510491388069475,
//     store_lon: 13.380505155941325,
//     timestamp: new Date(),
//   },
//   {
//     order_id: "1b6d06b4-ec20-4b19-96ee-67d934656b56",
//     dish_name: "Meeresfrüchtesalat mit Chili und Thai-Kräutem",
//     dish_price: 11.6,
//     store_name: "Restaurant Facil",
//     store_area: "Zone2",
//     store_lat: 52.509029388326915,
//     store_lon: 13.373680166244354,
//     timestamp: new Date(),
//   },
// ];

// -------------------------------------------------------
// Database Configuration
// -------------------------------------------------------

const dbConfig = {
  host: "my-app-mysql-service",
  port: "33060",
  user: "root",
  password: "mysecretpw",
  schema: "popular",
};

async function executeQuery(query, data) {
  let session = await mysqlx.getSession(dbConfig);
  return await session.sql(query, data).bind(data).execute();
}

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

async function getOrdersList(maxCount, offset) {
  const query = `SELECT o.order_id, d.dish_name, d.dish_price, s.store_name, s.store_lat, s.store_lon, o.timestamp
                   FROM orders o
                            JOIN dishes d on o.dish_id = d.dish_id
                            JOIN stores s ON s.store_id = o.store_id
                   ORDER BY o.timestamp DESC LIMIT ?
                   OFFSET ?`;
  const result = (await executeQuery(query, [maxCount, offset])).fetchAll().map((row) => ({
    order_id: row[0].trim(),
    dish_name: row[1],
    dish_price: row[2],
    store_name: row[3],
    store_area: "Zone XYZ", // ToDo: DB? Generator?
    store_lat: row[4],
    store_lon: row[5],
    timestamp: row[6],
  }));

  return result;
}

// Zurückgeben aller Bestellungen
router.get("/orders(/page/:page)?(/limit/:limit)?", (req, res) => {
  // Set pagination options
  const limit = parseInt(req.params.limit ? req.params.limit : 20);
  const offset = parseInt(req.params.page ? limit * (req.params.page - 1) : 0);

  // Use DB query and return data as JSON
  getOrdersList(limit, offset).then((data) => res.json(data));

  // Log req and res
  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

async function getSingleOrder(orderId) {
  console.log("getOrder()");
  const query = `SELECT o.order_id, d.dish_name, d.dish_price, s.store_name, s.store_lat, s.store_lon, o.timestamp
                   FROM orders o
                            JOIN dishes d on o.dish_id = d.dish_id
                            JOIN stores s ON s.store_id = o.store_id
                   WHERE o.order_id = ?;`;
  let data = (await executeQuery(query, [orderId])).fetchOne();

  const result = {
    order_id: data[0],
    dish_name: data[1],
    dish_price: data[2],
    store_name: data[3],
    store_area: "Zone XYZ", // ToDo: DB? Generator?
    store_lat: data[4],
    store_lon: data[5],
    timestamp: data[6],
  };

  console.log(result);
  return result;
}

// Zurückgeben einer bestimmten Bestellung
router.get("/order/:order_id", (req, res) => {
  const orderId = req.params.order_id;

  getSingleOrder(orderId).then((data) => res.json(data));

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

// Get popular dishes

async function getPopularDishes(maxCount) {
  const query = `SELECT d.dish_id, d.dish_name, d.dish_price, p.count
                   FROM popular_dish p
                            JOIN dishes d ON p.dish_id = d.dish_id
                   ORDER BY p.count DESC LIMIT ?;`;
  return (await executeQuery(query, [maxCount])).fetchAll().map((row) => ({
    dish_id: row[0],
    dish_name: row[1],
    dish_price: row[2],
    count: row[3],
  }));
}

router.get("popular/dishes/:count", (req, res) => {
  const maxCount = req.params.count;

  getPopularDishes(maxCount).then((result) => res.json(result));
});

// Get popular stores

async function getPopularStores(maxCount) {
  const query = `SELECT s.store_id, s.store_name, s.store_lat, s.store_lon, p.count
                   FROM popular_dish p
                            JOIN dishes d ON p.dish_id = d.dish_id
                   ORDER BY p.count DESC LIMIT ?;`;

  return (await executeQuery(query, [maxCount])).fetchAll().map((row) => ({
    store_id: row[0],
    store_name: row[1],
    store_lan: row[2],
    store_lon: row[3],
    count: row[4],
  }));
}

router.get("popular/stores/:count", (req, res) => {
  const maxCount = req.params.count;

  getPopularStores(maxCount).then((result) => res.json(result));
});

module.exports = router;
