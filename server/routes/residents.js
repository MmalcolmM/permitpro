const express = require("express");
const router = express.Router();
const controller = require("../controllers/residentsController");

router.get("/", controller.getResidents);
router.post("/", controller.createResident);
router.delete("/:id", controller.deleteResident);

module.exports = router;