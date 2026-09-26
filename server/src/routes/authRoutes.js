const express = require("express");
const {
  register,
  login,
  googleAuth,
  getMe,
  saveBusinessDetails,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.post("/business", protect, saveBusinessDetails);

module.exports = router;
