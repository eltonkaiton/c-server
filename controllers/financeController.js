const Booking = require("../models/Booking");

// ========================================
// GET ALL BOOKINGS
// ========================================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET SINGLE BOOKING
// ========================================
exports.getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// APPROVE PAYMENT ONLY
// ========================================
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ ONLY PAYMENT APPROVAL
    booking.paymentStatus = "Approved";
    booking.paymentApprovedAt = new Date();
    booking.paymentConfirmationDate = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment approved successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// REJECT PAYMENT ONLY
// ========================================
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ ONLY PAYMENT REJECTION
    booking.paymentStatus = "Rejected";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};