const mysqlx = require("@mysql/xdevapi");
const dns = require("dns").promises;
const memcachePlus = require("memcache-plus");

// ------------------------------------------------------------
// Datenbank Initialisierung
// ------------------------------------------------------------

const dbConfig = {
  host: "my-app-mysql-service",
  port: "33060",
  user: "root",
  password: "mysecretpw",
  schema: "popular",
};

const dbSessionConfig = {
  host: "my-app-mysql-service",
  port: "33060",
  user: "root",
  password: "mysecretpw",
};

async function executeQuery(query, data) {
  let session = await mysqlx.getSession(dbConfig);
  return await session.sql(query, data).bind(data).execute();
}

async function executeSimpleQuery(query) {
  let session = await mysqlx.getSession(dbConfig);
  return await session.sql(query).execute();
}

// -------------------------------------------------------
// Memcache Configuration
// -------------------------------------------------------

const cacheDefaultTTL = 15;

const memcachedConfig = {
  host: "my-memcached-service",
  port: 11211,
  updateInterval: 5000,
};

module.exports = {
  dbConfig: dbConfig,
  dbSessionConfig: dbSessionConfig,
  executeQuery: executeQuery,
  executeSimpleQuery: executeSimpleQuery,
  cacheDefaultTTL: cacheDefaultTTL,
  memcachedConfig: memcachedConfig,
};
