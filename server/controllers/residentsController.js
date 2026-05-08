const pool = require("../db");

exports.getResidents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM residents");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createResident = async (req, res) => {
  try {
    const { first_name, last_name, apartment_number, phone_number } = req.body;

    const result = await pool.query(
      `INSERT INTO residents (first_name, last_name, apartment_number, phone_number)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [first_name, last_name, apartment_number, phone_number]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteResident = async (req, res) => {
    try {
      const { id } = req.params;
  
      await pool.query("DELETE FROM residents WHERE id = $1", [id]);
  
      res.json({ message: "Resident deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };