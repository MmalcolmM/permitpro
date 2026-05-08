const express = require("express");
const cors = require("cors");
const pool = require("./db");
const residentsRoutes = require("./routes/residents");
const vehiclesRoutes = require('./routes/vehicles');
const app = express();

app.use(cors());
app.use(express.json());
app.use("/residents", residentsRoutes);
app.use("/vehicles", vehiclesRoutes);

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