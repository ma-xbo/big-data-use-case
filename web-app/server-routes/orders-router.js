const express = require("express");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");
const { executeQuery, executeSimpleQuery, cacheDefaultTTL, memcachedConfig } = require("./helper");

// Erstellen einer Express Router Instanz
const router = express.Router();

// -------------------------------------------------------
// Memcache Configuration
// -------------------------------------------------------

//Connect to the memcached instances
let memcached = null;
let memcachedServers = [];

async function getMemcachedServersFromDns() {
  try {
    // Query all IP addresses for this hostname
    let queryResult = await dns.lookup(memcachedConfig.host, { all: true });

    // Create IP:Port mappings
    let servers = queryResult.map((el) => el.address + ":" + memcachedConfig.port);

    // Check if the list of servers has changed
    // and only create a new object if the server list has changed
    if (memcachedServers.sort().toString() !== servers.sort().toString()) {
      console.log("Updated memcached server list to ", servers);
      memcachedServers = servers;

      //Disconnect an existing client
      if (memcached) await memcached.disconnect();

      memcached = new memcachePlus(memcachedServers);
    }
  } catch (e) {
    console.log("Unable to get memcache servers", e);
  }
}

//Initially try to connect to the memcached servers, then each 5s update the list
getMemcachedServersFromDns();
setInterval(() => getMemcachedServersFromDns(), memcachedConfig.updateInterval);

//Get data from cache if a cache exists yet
async function getFromCache(key) {
  if (!memcached) {
    console.log(`No memcached instance available, memcachedServers = ${memcachedServers}`);
    return null;
  }
  return await memcached.get(key);
}

// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

async function getOrdersListCached(maxCount, offset) {
  const cacheKey = "ordersList-c" + maxCount + "-o" + offset;
  let result = await getFromCache(cacheKey);
  let cached = false;
  console.log("Checking cache key " + cacheKey);

  if (!result) {
    console.log("Cache empty. Fetching from DB");
    const query = `SELECT o.order_id, d.dish_name, d.dish_price, s.store_name, s.store_lat, s.store_lon, o.timestamp
                     FROM orders o
                              JOIN dishes d on o.dish_id = d.dish_id
                              JOIN stores s ON s.store_id = o.store_id
                     ORDER BY o.timestamp DESC LIMIT ?
                     OFFSET ?`;
    result = (await executeQuery(query, [maxCount, offset])).fetchAll().map((row) => ({
      order_id: row[0].trim(),
      dish_name: row[1],
      dish_price: row[2],
      store_name: row[3],
      store_area: "Zone XYZ", // ToDo: DB? Generator?
      store_lat: row[4],
      store_lon: row[5],
      timestamp: row[6],
    }));

    if (memcached) {
      memcached.set(cacheKey, result, cacheDefaultTTL);
      console.log("Stored " + cacheKey + " in cache");
    }
    cached = false;
  } else {
    console.log("Serving " + cacheKey + " from cache");
    cached = true;
  }
  return { orders: result, cached: cached };
}

async function getOrdersList(maxCount, offset) {
  const query = `SELECT o.order_id, d.dish_name, d.dish_price, s.store_name, s.store_lat, s.store_lon, o.timestamp
                     FROM orders o
                              JOIN dishes d on o.dish_id = d.dish_id
                              JOIN stores s ON s.store_id = o.store_id
                     ORDER BY o.timestamp DESC LIMIT ?
                     OFFSET ?`;
  result = (await executeQuery(query, [maxCount, offset])).fetchAll().map((row) => ({
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
  getOrdersListCached(limit, offset).then((data) => res.json(data));

  // Log req and res
  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

async function getOrderStatistics() {
  //const query = `SELECT COUNT(order_id) FROM orders;`;
  const query = `SELECT COUNT(o.order_id) AS orderCount, AVG(d.dish_price) AS avgDishPrice
                  FROM orders o JOIN dishes d on o.dish_id = d.dish_id;`;
  let data = (await executeSimpleQuery(query)).fetchOne();

  console.log(data);

  const result = {
    orderCount: data[0],
    avgDishPrice: data[1],
  };

  return result;
}

// Zurückgeben der Anzahl an Bestellungen
router.get("/orders/statistics", (req, res) => {
  getOrderStatistics().then((data) => res.json(data));

  console.log("Request: Method=" + req.method + ", URL=" + req.originalUrl + "; Response: Status=" + res.statusCode);
});

async function getSingleOrder(orderId) {
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

  return result;
}

// Zurückgeben einer bestimmten Bestellung
router.get("/order/:order_id", (req, res) => {
  const orderId = req.params.order_id;

  getSingleOrder(orderId).then((data) => res.json(data));

  console.log("Request: Method=" + req.method + ", URL=" + req.originalUrl + "; Response: Status=" + res.statusCode);
});

module.exports = router;
