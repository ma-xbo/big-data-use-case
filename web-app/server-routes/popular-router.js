const express = require("express");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");
const {
  executeQuery,
  cacheDefaultTTL,
  memcachedConfig,
} = require("./helper");

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

// Funktion zur Abfrage der Popular Dishes aus Cache bzw. der Datenbank
async function getPopularDishes(maxCount) {
  const cacheKey = "popularDishes";
  let cached = false;
  let result = await getFromCache(cacheKey);
  console.log("Checking cache key " + cacheKey);

  if (!result) {
    console.log("Cache empty. Fetching from DB");
    const query = `SELECT d.dish_id, d.dish_name, d.dish_price, cd.count, rd.revenue
                     FROM count_dish cd
                              JOIN dishes d ON cd.dish_id = d.dish_id
                              JOIN revenue_dish rd ON cd.dish_id = rd.dish_id
                     ORDER BY cd.count DESC LIMIT ?;`;
    result = (await executeQuery(query, maxCount)).fetchAll().map((row) => ({
      dish_id: row[0].trim(),
      dish_name: row[1],
      dish_price: row[2],
      count: row[3],
      revenue: row[4],
    }));

    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL);
      console.log("Stored " + cacheKey + " in cache");
    }
    cached = false;
  } else {
    console.log("Serving " + cacheKey + " from cache");
    cached = true;
  }

  return { dishes: result, cached: cached };
}

// Router zum Zurückgeben der Popular Dishes an das Frontend
router.get("/dishes/:count", (req, res) => {
  const maxCount = parseInt(req.params.count);

  try {
    getPopularDishes(maxCount).then((result) => {
      res.json(result);
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

// Funktion zur Abfrage der Popular Stores aus Cache bzw. der Datenbank
async function getPopularStores(maxCount) {
  const cacheKey = "popularStores";
  let cached = false;
  let result = await getFromCache(cacheKey);
  console.log("Checking cache key " + cacheKey);

  if (!result) {
    console.log("Cache empty. Fetching from DB");
    const query = `SELECT s.store_id, s.store_name, s.store_lat, s.store_lon, cs.count, rs.revenue
                     FROM count_store cs
                              JOIN stores s ON cs.store_id = s.store_id
                              JOIN revenue_store rs ON cs.store_id = rs.store_id
                     ORDER BY cs.count DESC LIMIT ?;`;

    result = (await executeQuery(query, maxCount)).fetchAll().map((row) => ({
      store_id: row[0].trim(),
      store_name: row[1],
      store_lat: row[2],
      store_lon: row[3],
      count: row[4],
      revenue: row[5],
    }));

    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL);
      console.log("Stored " + cacheKey + " in cache");
    }
    cached = false;
  } else {
    console.log("Serving " + cacheKey + " from cache");
    cached = true;
  }

  return { stores: result, cached: cached };
}

// Router zum Zurückgeben der Popular Stores an das Frontend
router.get("/stores/:count", (req, res) => {
  const maxCount = parseInt(req.params.count);

  try {
    getPopularStores(maxCount).then((result) => {
      res.json(result);
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }

  console.log(
    "Request: " + "Method=" + req.method + ", URL=" + req.originalUrl + "; Response: " + "Status=" + res.statusCode
  );
});

module.exports = router;
