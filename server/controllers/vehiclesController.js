const pool = require("../db");
// “Export an async function called getVehicles
// that Express can run when a request comes in.”
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

        if (resident_id) {
            const residentResult = await pool.query(
                "SELECT * FROM residents WHERE id = $1",
                [resident_id]
            );

            if (residentResult.rows.length === 0) {
                return res.status(404).json({ error: "Resident not found" });
            }
        }

        const existingVehicle = await pool.query(
            "SELECT * FROM vehicles WHERE plate_number = $1",
            [plate_number]
        );

        if (existingVehicle.rows.length > 0) {
            return res.status(400).json({ error: "Vehicle already exists" });
        }

        const newVehicle = await pool.query(
            "INSERT INTO vehicles (resident_id, make, model, color, plate_number, plate_state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            // allows a vehicle to be added if resident_id is null
            [resident_id || null, make, model, color, plate_number, plate_state]
        );
        res.json(newVehicle.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehicleByPlate = async (req, res) => {
    try {
        const { plate_number } = req.params;

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