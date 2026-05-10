const pool = require("../db");

/*
 * Controllers export async (req, res) handlers Express can mount by reference.
 * Async errors do not automatically become HTTP responses unless you try/catch or use centralized error middleware—hence try/catch here.
 * Next time: Add express-async-errors or an async wrapper once repetition grows, so route handlers stay one indentation thinner.
 */
exports.getVehicles = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM vehicles");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' })
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const {
            resident_id,
            make,
            model,
            color,
            plate_number,
            plate_state
        } = req.body;

        /*
         * Conditional FK check: only validate resident exists when resident_id is provided.
         * Why: Supports enforcement workflows—vehicle rows without a resident (resident_id NULL) still represent a plate on property.
         * Next time: Mirror this rule in SQL (nullable FK + optional UNIQUE on plate if that's your domain invariant).
         */
        if (resident_id) {
            const residentResult = await pool.query(
                "SELECT * FROM residents WHERE id = $1",
                [resident_id]
            );

            if (residentResult.rows.length === 0) {
                return res.status(404).json({ error: "Resident not found" });
            }
        }

        /*
         * Application-level uniqueness check before INSERT gives a clear 400 instead of a raw duplicate-key error from Postgres.
         * Next time: Still add a UNIQUE constraint on plate_number (and maybe composite with state) so concurrent requests can't slip duplicates past this check.
         */
        const existingVehicle = await pool.query(
            "SELECT * FROM vehicles WHERE plate_number = $1",
            [plate_number]
        );

        if (existingVehicle.rows.length > 0) {
            return res.status(400).json({ error: "Vehicle already exists" });
        }

        const newVehicle = await pool.query(
            "INSERT INTO vehicles (resident_id, make, model, color, plate_number, plate_state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            /* Empty/missing resident_id becomes SQL NULL for nullable FK column */
            [resident_id || null, make, model, color, plate_number, plate_state]
        );
        res.json(newVehicle.rows[0]);

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getVehicleByPlate = async (req, res) => {
    try {
        const { plate_number } = req.params;

        /*
         * LEFT JOIN residents: always return the vehicle row; attach resident columns when resident_id matches.
         * INNER JOIN would hide vehicles without residents—bad for lookup-by-plate when you still want vehicle facts.
         * Next time: SELECT explicit columns or aliases if JOIN keys produce ambiguous duplicate column names in clients.
         */
        const result = await pool.query(
            `SELECT *
             FROM vehicles
             LEFT JOIN residents
             ON vehicles.resident_id = residents.id
             WHERE vehicles.plate_number = $1`,
            [plate_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM vehicles WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await pool.query(
            "SELECT * FROM vehicles WHERE id = $1",
            [id]
        );

        if (vehicle.rows.length === 0 ){
            return res.status(404).json({error: "Vehicle not found"})
        }

        await pool.query(
            "DELETE FROM vehicles WHERE id = $1",
            [id]
        );

        res.json({message: 'Vehicle deleted'});

    } catch (error) {
        res.status(500).json({error: 'Server Error'});
    }
};
