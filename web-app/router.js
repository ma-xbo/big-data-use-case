const express = require("express");
const mysqlx = require("@mysql/xdevapi");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");

// Erstellen einer Express Router Instanz
const router = express.Router();

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

// -------------------------------------------------------
// Memcache Configuration
// -------------------------------------------------------

//Connect to the memcached instances
let memcached = null
let memcachedServers = []
const cacheDefaultTTL = 15;

const memcachedConfig = {
  host: 'my-memcached-service',
  port: 11211,
  updateInterval: 5000,
};

async function getMemcachedServersFromDns() {
  try {
    // Query all IP addresses for this hostname
    let queryResult = await dns.lookup(memcachedConfig.host, { all: true })

    // Create IP:Port mappings
    let servers = queryResult.map(el => el.address + ":" + memcachedConfig.port)

    // Check if the list of servers has changed
    // and only create a new object if the server list has changed
    if (memcachedServers.sort().toString() !== servers.sort().toString()) {
      console.log("Updated memcached server list to ", servers)
      memcachedServers = servers

      //Disconnect an existing client
      if (memcached)
        await memcached.disconnect()

      memcached = new memcachePlus(memcachedServers);
    }
  } catch (e) {
    console.log("Unable to get memcache servers", e)
  }
}

//Initially try to connect to the memcached servers, then each 5s update the list
getMemcachedServersFromDns()
setInterval(() => getMemcachedServersFromDns(), memcachedConfig.updateInterval)

//Get data from cache if a cache exists yet
async function getFromCache(key) {
  if (!memcached) {
    console.log(`No memcached instance available, memcachedServers = ${memcachedServers}`)
    return null;
  }
  return await memcached.get(key);
}


// ------------------------------------------------------------
// Routenhandler
// ------------------------------------------------------------

async function getOrdersList(maxCount, offset) {

  const cacheKey = 'ordersList';
  let result = await getFromCache(cacheKey);
  console.log('Checking cache key ' + cacheKey)
  if(!result){
    console.log('Cache empty. Fetching from DB')
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
      memcached.set(cacheKey, result, cacheDefaultTTL)
      console.log('Stored ' + cacheKey + ' in cache');
    }

  } else {
    console.log('Serving ' + cacheKey + ' from cache')
  }

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

// Funktion zur Abfrage der Popular Dishes aus Cache bzw. der Datenbank
async function getPopularDishes(maxCount) {
  const cacheKey = 'popularDishes';
  let result = await getFromCache(cacheKey);
  console.log('Checking cache key ' + cacheKey);

  if(!result){
    console.log('Cache empty. Fetching from DB')
    const query = `SELECT d.dish_id, d.dish_name, d.dish_price, cd.count, rd.revenue
                   FROM count_dish cd
                            JOIN dishes d ON cd.dish_id = d.dish_id
                            JOIN revenue_dish rd ON cd.dish_id = rd.dish_id
                   ORDER BY cd.count DESC LIMIT ?;`;
    result = (await executeQuery(query, maxCount)).fetchAll().map((row) => ({
      dish_id: row[0],
      dish_name: row[1],
      dish_price: row[2],
      count: row[3],
      revenue: row[4],
    }));

    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL)
      console.log('Stored ' + cacheKey + ' in cache');
    }

  } else {
    console.log('Serving ' + cacheKey + ' from cache')
  }

  return result;
}

// Router zum Zurückgeben der Popular Dishes an das Frontend
router.get("/popular/dishes/:count", (req, res) => {
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
  const cacheKey = 'popularStores';
  let result = await getFromCache(cacheKey);
  console.log('Checking cache key ' + cacheKey);

  if (!result){
    console.log('Cache empty. Fetching from DB')
    const query = `SELECT s.store_id, s.store_name, s.store_lat, s.store_lon, cs.count, rs.revenue
                   FROM count_store cs
                            JOIN stores s ON cs.store_id = s.store_id
                            JOIN revenue_store rs ON cs.store_id = rs.store_id
                   ORDER BY cs.count DESC LIMIT ?;`;

    result = (await executeQuery(query, maxCount)).fetchAll().map((row) => ({
      store_id: row[0],
      store_name: row[1],
      store_lat: row[2],
      store_lon: row[3],
      count: row[4],
      revenue: row[5],
    }));

    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL)
      console.log('Stored ' + cacheKey + ' in cache');
    }

  } else {
    console.log('Serving ' + cacheKey + ' from cache')
  }
  return result;
}

// Router zum Zurückgeben der Popular Stores an das Frontend
router.get("/popular/stores/:count", (req, res) => {
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
