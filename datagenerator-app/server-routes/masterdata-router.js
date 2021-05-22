const express = require("express");
const mysqlx = require("@mysql/xdevapi");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");

// Erstellen einer Express Router Instanz
const router = express.Router();

// ------------------------------------------------------------
// Datenbank Initialisierung
// ------------------------------------------------------------

const dbSessionConfig = {
  host: "my-app-mysql-service",
  port: "33060",
  user: "root",
  password: "mysecretpw",
};

// -------------------------------------------------------
// Memcache Configuration
// -------------------------------------------------------

const cacheDefaultTTL = 15;
const memcachedConfig = {
  host: "my-memcached-service",
  port: 11211,
  updateInterval: 5000,
};

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

/* 
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
 */

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

/* 
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
 */
module.exports = router;
