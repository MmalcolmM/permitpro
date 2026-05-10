require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const residentsRoutes = require("./routes/residents");
const vehiclesRoutes = require("./routes/vehicles");
const violationsRoutes = require("./routes/violations");
const authRoutes = require("./routes/auth")
const app = express();

/*
 * Middleware stack (order matters: runs top-to-bottom on every request unless a route short-circuits).
 *
 * - cors(): Allows browsers on other origins to call this API during development (and later, configured origins in prod).
 *           Without it, frontends on another port/domain hit browser "blocked by CORS" errors even when the server is fine.
 *
 * - express.json(): Parses JSON bodies into req.body for POST/PUT/PATCH. Without it, req.body is undefined.
 *
 * Next time: Add shared middleware here (request logging, auth, rate limiting) so every route gets it consistently.
 */
app.use(cors());
app.use(express.json());

/*
 * Modular routers mounted at URL prefixes.
 * Each router file only defines paths *relative* to the prefix (e.g. "/" here becomes "/residents").
 * Why it works: Keeps index.js as composition root; adding a new domain (/violations) is one require + app.use.
 * Next time: Keep index.js thin—mount routers only; put logic in controllers/services.
 */
app.use("/residents", residentsRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/violations", violationsRoutes);
app.use("/auth", authRoutes);

/*
 * Sanity route: proves HTTP + DB in one round-trip.
 * SELECT NOW() is cheap and needs no tables—ideal for "is Postgres reachable?" smoke checks.
 * Next time: Consider /health that skips DB (process up) vs /ready that hits DB (dependencies OK) for ops dashboards.
 */
app.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      console.log("DB WORKS:", result.rows);
      res.json({
        message: "API is working",
        time: result.rows[0]
      });
    } catch (err) {
      console.error("DB ERROR:", err);
      res.status(500).json({
        error: err.message
      });
    }
  });

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// “I structured the backend using a controller-service pattern to separate routing logic from business logic and database access.”
// “I designed the system to allow vehicles without a resident association to support enforcement scenarios where unknown vehicles are detected on property.”