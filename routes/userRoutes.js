const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");

// =======================
// CREATE USER
// =======================
router.post("/", createUser);

// =======================
// GET ALL USERS
// =======================
router.get("/", getUsers);

// =======================
// UPDATE USER STATUS
// (Approve / Reject / Suspend)
// =======================
router.put("/:id/status", updateUserStatus);

// =======================
// DELETE USER
// =======================
router.delete("/:id", deleteUser);

module.exports = router;