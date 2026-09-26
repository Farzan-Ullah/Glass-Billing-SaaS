const express = require("express");
const router = express.Router();
const challanController = require("../controllers/challanController");

router.get("/", challanController.getAllChallans);
router.get("/:id", challanController.getChallanById);
router.post("/", challanController.createChallan);
router.put("/:id", challanController.updateChallan);
router.patch("/:id/status", challanController.updateStatus);
router.delete("/:id", challanController.deleteChallan);

module.exports = router;
