const express = require("express");
const router = express.Router();
const seedDatabase = require("../seed");

router.post("/", async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
