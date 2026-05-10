const express = require("express");
const router = express.Router();
const controller = require("../controllers/residentsController");

/*
 * Router = mini-app: register handlers on paths relative to where this router is mounted ("/residents" in index.js).
 * Pattern: router.METHOD(path, controller.handler) keeps HTTP wiring declarative; controllers stay testable async functions.
 *
 * Next time: Add PATCH /:id here when you need updates; keep DELETE/GET patterns consistent across resources.
 */
router.get("/", controller.getResidents);
router.post("/", controller.createResident);
router.delete("/:id", controller.deleteResident);

module.exports = router;

/*
 * Routes stay "traffic directors": no SQL, no heavy validation rules—those belong in controllers or a validation layer.
 * Next time: If validation grows, extract a small validate middleware or schema (e.g. zod/joi) and attach before the controller.
 */
