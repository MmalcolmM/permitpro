const { Pool } = require("pg");

/*
 * pg Pool: maintains a set of reusable connections to Postgres.
 * Why Pool over a single Client: Under concurrent requests, Pool hands out idle connections instead of opening one per request.
 * How it works: Queries use pool.query(...); the pool acquires/releases connections automatically.
 *
 * Next time: Load host/user/password/database from process.env (and dotenv in development) so credentials never ship in code,
 *           and the same codebase targets local/staging/prod by changing env only.
 */
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "permitpro_db",
  port: 5432
});

module.exports = pool;
