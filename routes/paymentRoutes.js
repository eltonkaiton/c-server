const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/paymentController");

// ===============================
// CREATE PAYMENT
// ===============================
router.post("/", createPayment);

// ===============================
// GET ALL PAYMENTS
// ===============================
router.get("/", getPayments);

// ===============================
// UPDATE PAYMENT STATUS
// ===============================
router.put("/:id", updatePaymentStatus);

// ===============================
// DELETE PAYMENT
// ===============================
router.delete("/:id", deletePayment);

module.exports = router;