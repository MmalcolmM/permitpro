const express = require("express");
const router = express.Router();
const controller = require("../controllers/residentsController");

router.get("/", controller.getResidents); // gets ALL residents. taking in 2 arguments '/', 'controller.getResidents' from the controller.
router.post("/", controller.createResident);
router.delete("/:id", controller.deleteResident);

module.exports = router;

/** 
routes file = traffic director
It DOESN’T:
query DB
contain business logic
validate data 
**/