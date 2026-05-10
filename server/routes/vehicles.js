const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehiclesController");

router.get("/", controller.getVehicles);
router.post("/", controller.createVehicle);

/*
 * Route order matters in Express: first matching route wins.
 *
 * If GET "/:id" were registered *before* GET "/plate/:plate_number", a request to GET /vehicles/plate/ABC123 would hit
 * ":id" with id === "plate" (wrong). Putting the more specific "/plate/:plate_number" first reserves that path shape.
 *
 * Next time: Always register static path segments and multi-segment routes before generic ":param" catch-alls on the same prefix.
 */
router.get("/plate/:plate_number", controller.getVehicleByPlate);
router.get("/:id", controller.getVehicleById);
router.delete("/:id", controller.deleteVehicle);



module.exports = router;

/** 
routes file = traffic director
It DOESN’T:
query DB
contain business logic
validate data 
**/

/*
 * Routes stay "traffic directors": no SQL, no heavy validation rules—those belong in controllers or a validation layer.
 * Next time: If validation grows, extract a small validate middleware or schema (e.g. zod/joi) and attach before the controller.
 */
