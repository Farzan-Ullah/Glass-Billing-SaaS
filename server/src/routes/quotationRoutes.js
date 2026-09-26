const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");

router.get("/", quotationController.getAllQuotations);
router.get("/:id", quotationController.getQuotationById);
router.post("/", quotationController.createQuotation);
router.put("/:id", quotationController.updateQuotation);
router.delete("/:id", quotationController.deleteQuotation);
router.post("/:id/convert-proforma", quotationController.convertToProforma);

module.exports = router;
