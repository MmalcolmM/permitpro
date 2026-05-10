const pool = require("../db");

exports.getResidents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM residents");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createResident = async (req, res) => {
  try {
    const { first_name, last_name, apartment_number, phone_number } = req.body;

    /*
     * Validate required fields before touching the DB: fail fast with 400 (client error), save round-trips,
     * and return a stable API contract instead of a DB constraint error leaking raw Postgres messages.
     * Next time: Align validation with DB NOT NULL / CHECK constraints so behavior matches schema docs.
     */
    if (!first_name || !last_name || !apartment_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /*
     * Parameterized query ($1, $2, ...): driver sends values separately from SQL text—prevents SQL injection even if
     * strings contained quotes or malicious fragments.
     * RETURNING * avoids a second SELECT to send the created row back to the client.
     * Next time: Prefer RETURNING only the columns clients need if tables grow wide or contain sensitive fields.
     */
    const result = await pool.query(
      `INSERT INTO residents (first_name, last_name, apartment_number, phone_number)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [first_name, last_name, apartment_number, phone_number]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteResident = async (req, res) => {
    try {
      const { id } = req.params;

      /*
       * Destructive ops: check existence first → respond 404 if missing; otherwise DELETE then 200.
       * Why not blindly DELETE: clients can tell "nothing existed" vs "server blew up" (500).
       * Next time: Consider DB FK behavior—deleting a resident may fail if vehicles still reference them unless ON DELETE is set.
       */
      const resident = await pool.query(
        "SELECT * FROM residents WHERE id = $1",
        [id]
      );

      if (resident.rows.length === 0){
        return res.status(404).json({error: "Resident not found"})
      }

      await pool.query("DELETE FROM residents WHERE id = $1", [id]);

      res.json({ message: "Resident deleted" });
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  };
