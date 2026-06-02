const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// ===============================
// REGISTER USER
// ===============================
router.post("/register", registerUser);

// ===============================
// LOGIN USER
// ===============================
router.post("/login", loginUser);

module.exports = router;