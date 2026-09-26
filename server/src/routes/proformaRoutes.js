const express = require("express");
const router = express.Router();
const proformaController = require("../controllers/proformaController");

router.get("/", proformaController.getAllProformas);
router.get("/:id", proformaController.getProformaById);
router.post("/", proformaController.createProforma);
router.put("/:id", proformaController.updateProforma);
router.delete("/:id", proformaController.deleteProforma);
router.post("/:id/record-advance", proformaController.recordAdvance);
router.post("/:id/convert-invoice", proformaController.convertToInvoice);

module.exports = router;
