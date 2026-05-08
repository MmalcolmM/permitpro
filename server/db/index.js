const { Pool } = require("pg");

module.exports = new Pool({
  user: "postgres",
  host: "localhost",
  database: "permitpro_db",
  port: 5432,
});

module.exports = pool;