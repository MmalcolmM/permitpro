const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehiclesController");

router.get("/", controller.getVehicles);
router.post("/", controller.createVehicle);
router.get("/plate/:plate_number", controller.getVehicleByPlate);




module.exports = router;












/** 
routes file = traffic director
It DOESN’T:
query DB
contain business logic
validate data 
**/