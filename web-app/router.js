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
let memcached = null;
let memcachedServers = [];
const cacheDefaultTTL = 15;

const memcachedConfig = {
  host: "my-memcached-service",
  port: 11211,
  updateInterval: 5000,
};

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



module.exports = router;
