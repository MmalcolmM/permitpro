const pool = require("../db");

exports.getViolations = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM violations");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getViolationsByPlate = async (req, res) => {
    try {
        const { plate_number } = req.params;

        const result = await pool.query(
            `SELECT 
                v.id AS violation_id,
                v.violation_type,
                v.notes,
                v.created_at,
        
                ve.id AS vehicle_id,
                ve.make,
                ve.model,
                ve.color,
                ve.plate_number,
                ve.plate_state,
        
                r.id AS resident_id,
                r.first_name,
                r.last_name,
                r.apartment_number,
                r.phone_number
        
             FROM violations v
             JOIN vehicles ve ON v.vehicle_id = ve.id
             LEFT JOIN residents r ON ve.resident_id = r.id
             WHERE ve.plate_number = $1`,
            [plate_number]
        );

        if (result.rows.length === 0 ) {
            return res.status(404).json({ error: "No violation records exist for this vehicle"})
        }

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};


exports.createViolation = async (req, res) => {
    try {
        const {
            vehicle_id,
            violation_type,
            notes
        } = req.body;

        const vehicle = await pool.query(
            "SELECT * FROM vehicles WHERE id = $1",
            [vehicle_id]
        );

        if (vehicle.rows.length === 0) {
            return res.status(404).json({ error: "Vehicle not found" })

        }

        const result = await pool.query(
            `INSERT INTO violations (vehicle_id, violation_type, notes)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [vehicle_id, violation_type, notes]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Server Error" })
    }
};