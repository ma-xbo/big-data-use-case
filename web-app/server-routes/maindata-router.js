const express = require("express");
const { v4: uuidv4 } = require("uuid");
const mysqlx = require("@mysql/xdevapi");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");
const {
  dbConfig,
  dbSessionConfig,
  executeQuery,
  executeSimpleQuery,
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

// Funktion zur Abfrage der angelegten Gerichte aus Cache bzw. der Datenbank
async function getMaindataDishes() {
  const cacheKey = "mdDishes";
  let cached = false;
  let result = await getFromCache(cacheKey);

  if (!result) {
    console.log('Cache with cache key "' + cacheKey + '" is empty. Fetching from DB');

    // Auslesen der Daten aus der Datenbank
    result = await mysqlx.getSession(dbSessionConfig).then((session) => {
      dishesTable = session.getSchema("popular").getTable("dishes");

      const dishes = dishesTable
        .select(["dish_id", "dish_name", "dish_price"])
        .execute()
        .then((result) => {
          const data = result.fetchAll().map((row) => ({
            dish_id: row[0].trim(),
            dish_name: row[1],
            dish_price: row[2],
          }));

          return data;
        });
      return dishes;
    });

    // Schreiben der Daten in den Cache
    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL);
      console.log("Stored data in cache with cache key: " + cacheKey);
    }
    cached = false;
  } else {
    console.log("Serving data from cache with cache key: " + cacheKey);
    cached = true;
  }

  return { dishes: result, cached: cached };
}

// Ausgeben der in der Datenbank vorhandenen Gerichte
router.get("/dishes", (req, res) => {
  // Daten aus DB auslesen
  try {
    getMaindataDishes().then((result) => {
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

// Router zum Anlegen eines neuen Gerichts
router.post("/dish", (req, res) => {
  const dish = req.body;

  // Eintrag in Datenbank hinzufügen
  try {
    mysqlx.getSession(dbSessionConfig).then(function (session) {
      ordersTable = session.getSchema("popular").getTable("dishes");

      // Einfügen der Daten in die Dishes-Tabelle
      return ordersTable
        .insert(["dish_id", "dish_name", "dish_price"])
        .values([uuidv4(), dish.dish_name, dish.dish_price])
        .execute();
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.send(error);
  }

  // Log req and res
  console.log(
    "Request: Method=" + req.method + ", Data=",
    dish,
    ", URL=" + req.originalUrl,
    "; Response: Status=" + res.statusCode
  );
});

// Funktion zur Abfrage der angelegten Stores aus Cache bzw. der Datenbank
async function getMaindataStores() {
  const cacheKey = "mdStores";
  let cached = false;
  let result = await getFromCache(cacheKey);

  if (!result) {
    console.log('Cache with cache key "' + cacheKey + '" is empty. Fetching from DB');

    // Auslesen der Daten aus der Datenbank
    result = await mysqlx.getSession(dbSessionConfig).then((session) => {
      storesTable = session.getSchema("popular").getTable("stores");

      const stores = storesTable
        .select(["store_id", "store_name", "store_lat", "store_lon"])
        .execute()
        .then((result) => {
          const data = result.fetchAll().map((row) => ({
            store_id: row[0].trim(),
            store_name: row[1],
            store_lat: row[2],
            store_lon: row[3],
          }));

          return data;
        });
      return stores;
    });

    // Schreiben der Daten in den Cache
    if (memcached) {
      await memcached.set(cacheKey, result, cacheDefaultTTL);
      console.log("Stored data in cache with cache key: " + cacheKey);
    }
    cached = false;
  } else {
    console.log("Serving data from cache with cache key: " + cacheKey);
    cached = true;
  }

  return { stores: result, cached: cached };
}

// Ausgeben der in der Datenbank vorhandenen Restaurants
router.get("/stores", (req, res) => {
  // Daten aus DB auslesen
  try {
    getMaindataStores().then((result) => {
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

// Router zum Anlegen eines neuen Restaurants
router.post("/store", (req, res) => {
  const store = req.body;

  // Eintrag in Datenbank hinzufügen
  try {
    mysqlx.getSession(dbSessionConfig).then((session) => {
      storesTable = session.getSchema("popular").getTable("stores");

      // Einfügen der Daten in die Dishes-Tabelle
      return storesTable
        .insert(["store_id", "store_name", "store_lat", "store_lon"])
        .values([uuidv4(), store.store_name, store.store_lat, store.store_lon])
        .execute();
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.send(error);
  }

  // Loggen der Metadaten des Requests
  console.log(
    "Request: Method=" + req.method + ", Data=",
    store,
    ", URL=" + req.originalUrl,
    "; Response: Status=" + res.statusCode
  );
});

module.exports = router;
