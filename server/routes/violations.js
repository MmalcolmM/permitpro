// gived access to router, middleware, HHTP methods
const express = require("express");
// lets me define router.get(), router.post() .delete()
const router = express.Router();
const controller = require('../controllers/violationsController');

router.get("/", controller.getViolations);
router.get("/plate/:plate_number", controller.getViolationsByPlate);
router.post("/", controller.createViolation);


module.exports = router;