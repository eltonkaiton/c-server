const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getSupervisorBookings,
  getUserBookings,
  getSingleBooking,
  updatePaymentStatus,
  updateBookingStatus,
  deleteBooking,
  assignSupervisor,
  assignDealers,
  updateWorkStatus,
  submitRatingAndFeedback,  // ← UPDATED: changed from confirmEventCompletion
  updateLogistics,
  updateFinanceStatus,
  getBookingStats,
} = require("../controllers/bookingController");

// ===============================
// CREATE BOOKING
// ===============================
router.post("/", createBooking);

// ===============================
// GET ALL BOOKINGS
// ===============================
router.get("/", getBookings);

// ===============================
// GET SUPERVISOR BOOKINGS
// ===============================
router.get("/supervisor/:supervisorId", getSupervisorBookings);

// ===============================
// GET USER BOOKINGS
// ===============================
router.get("/user/:userId", getUserBookings);

// ===============================
// GET SINGLE BOOKING
// ===============================
router.get("/:id", getSingleBooking);

// ===============================
// GET BOOKING STATISTICS
// ===============================
router.get("/stats/all", getBookingStats);

// ===============================
// UPDATE PAYMENT STATUS (FINANCE ONLY)
// ===============================
router.put("/:id/payment-status", updatePaymentStatus);

// ===============================
// UPDATE BOOKING STATUS (SERVICE MANAGER ONLY)
// ===============================
router.put("/:id/status", updateBookingStatus);

// ===============================
// ASSIGN SUPERVISOR
// ===============================
router.put("/:id/assign", assignSupervisor);

// ===============================
// ASSIGN DEALERS
// ===============================
router.put("/:id/assign-dealers", assignDealers);

// ===============================
// UPDATE WORK STATUS (SUPERVISOR)
// ===============================
router.put("/:id/work-status", updateWorkStatus);

// ===============================
// SUBMIT RATING AND FEEDBACK (CUSTOMER) - NO OTP
// ===============================
router.post("/:id/confirm", submitRatingAndFeedback);  // ← UPDATED function name

// ===============================
// UPDATE LOGISTICS
// ===============================
router.put("/:id/logistics", updateLogistics);

// ===============================
// UPDATE FINANCE STATUS
// ===============================
router.put("/:id/finance-status", updateFinanceStatus);

// ===============================
// DELETE BOOKING
// ===============================
router.delete("/:id", deleteBooking);

module.exports = router;