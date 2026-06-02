const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getSupervisorBookings,
  getUserBookings,
  getSingleBooking,
  updatePaymentStatus,      // Finance updates payment
  updateBookingStatus,      // Service Manager updates booking
  deleteBooking,
  assignSupervisor,
  updateWorkStatus,
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
// UPDATE WORK STATUS
// ===============================
router.put("/:id/work-status", updateWorkStatus);

// ===============================
// DELETE BOOKING
// ===============================
router.delete("/:id", deleteBooking);

module.exports = router;