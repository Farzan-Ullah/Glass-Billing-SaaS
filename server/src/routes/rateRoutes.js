const express = require("express");
const router = express.Router();
const rateController = require("../controllers/rateController");

router.get("/", rateController.getAllRates);
router.get("/tier/:tier", rateController.getRateByTier);
router.post("/", rateController.createRate);
router.put("/:id", rateController.updateRate);

module.exports = router;
