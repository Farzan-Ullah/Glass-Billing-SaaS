const express = require("express");
const router = express.Router();
const estimateController = require("../controllers/estimateController");

router.get("/", estimateController.getAllEstimates);
router.get("/:id", estimateController.getEstimateById);
router.post("/", estimateController.createEstimate);
router.put("/:id", estimateController.updateEstimate);
router.delete("/:id", estimateController.deleteEstimate);
router.post("/:id/convert-quotation", estimateController.convertToQuotation);

module.exports = router;
