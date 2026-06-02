const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// =====================================
// ✅ CREATE BOOKING
// =====================================
const createBooking = async (req, res) => {
  console.log("═══════════════════════════════════");
  console.log("🔵 CREATE BOOKING REQUEST RECEIVED");
  console.log("═══════════════════════════════════");
  console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  
  try {
    const {
      userId,
      customerName,
      email,
      phone,
      gameId,
      gameTitle,
      price,
      eventDate,
      location,
      guests,
      paymentMethod,
      paymentStatus,
      transactionCode,
      mpesaReceiptNumber,
      mpesaPhoneNumber,
      mpesaAmount,
      paidAmount,
    } = req.body;

    if (!userId) {
      console.log("❌ Missing userId");
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid userId format:", userId);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    console.log("✅ All validations passed");

    const priceNum = price ? parseFloat(price) : 0;
    const paidAmountNum = paidAmount ? parseFloat(paidAmount) : (priceNum * 1.05);
    const mpesaAmountNum = mpesaAmount ? parseFloat(mpesaAmount) : (priceNum * 1.05);
    const calculatedRemainingBalance = priceNum - paidAmountNum;
    
    console.log(`💰 Price: ${priceNum}, Paid: ${paidAmountNum}, Remaining: ${calculatedRemainingBalance}`);

    const bookingData = {
      userId: new mongoose.Types.ObjectId(userId),
      customerName: customerName || "",
      email: email || "",
      phone: phone || "",
      gameId: gameId || "",
      gameTitle: gameTitle || "",
      price: priceNum,
      eventDate: eventDate || "",
      location: location || "",
      guests: guests ? parseInt(guests) : 1,
      status: "Pending", // Booking status (for Service Manager)
      workStatus: "Unassigned",
      paymentMethod: paymentMethod || "M-Pesa",
      paymentStatus: paymentStatus || "Pending", // Payment status (for Finance)
      transactionCode: transactionCode ? transactionCode.toUpperCase().trim() : "",
      mpesaReceiptNumber: mpesaReceiptNumber || "",
      mpesaPhoneNumber: mpesaPhoneNumber || phone,
      mpesaAmount: mpesaAmountNum,
      paidAmount: paidAmountNum,
      remainingBalance: calculatedRemainingBalance,
    };

    console.log("📝 Creating booking with data:", JSON.stringify(bookingData, null, 2));

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    console.log("✅ Booking created successfully!");
    console.log("📊 Booking ID:", savedBooking._id);
    console.log("═══════════════════════════════════");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.log("═══════════════════════════════════");
    console.log("❌ BOOKING CREATION FAILED");
    console.log("═══════════════════════════════════");
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}: ${error.value}`,
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected",
        duplicateField: Object.keys(error.keyPattern)[0],
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message,
    });
  }
};

// =====================================
// ✅ GET ALL BOOKINGS
// =====================================
const getBookings = async (req, res) => {
  try {
    console.log("📡 Fetching all bookings");
    
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position");

    console.log(`✅ Found ${bookings.length} bookings`);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ✅ GET SUPERVISOR BOOKINGS
// =====================================
const getSupervisorBookings = async (req, res) => {
  try {
    const { supervisorId } = req.params;
    
    console.log(`📡 Fetching bookings for supervisor: ${supervisorId}`);

    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supervisor ID format",
      });
    }

    const bookings = await Booking.find({
      assignedSupervisor: supervisorId,
    })
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for supervisor ${supervisorId}`);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Supervisor bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch supervisor bookings",
      error: error.message,
    });
  }
};

// =====================================
// ✅ GET USER BOOKINGS
// =====================================
const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📡 Fetching bookings for user: ${userId}`);

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for user`);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ✅ GET SINGLE BOOKING
// =====================================
const getSingleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📡 Fetching booking: ${id}`);

    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position");

    if (!booking) {
      console.log(`❌ Booking not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log(`✅ Booking found: ${booking._id}`);

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("❌ Error fetching single booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ✅ UPDATE PAYMENT STATUS (FOR FINANCE)
// =====================================
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentNotes, price, paidAmount, remainingBalance } = req.body;
    const { id } = req.params;

    console.log(`💰 Finance updating payment for booking ${id}`);
    console.log(`   Payment Status: ${paymentStatus}`);
    console.log(`   Notes: ${paymentNotes || 'No notes'}`);

    const booking = await Booking.findById(id);

    if (!booking) {
      console.log(`❌ Booking not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate paymentStatus
    if (paymentStatus && !["Pending", "Approved", "Rejected", "Completed"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paymentStatus",
      });
    }

    // Update payment fields
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
      
      if (paymentStatus === "Approved" && !booking.paymentApprovedAt) {
        booking.paymentApprovedAt = new Date();
      }
      
      if (paymentStatus === "Rejected" && !booking.paymentRejectedAt) {
        booking.paymentRejectedAt = new Date();
      }
    }

    if (paymentNotes !== undefined) {
      booking.paymentNotes = paymentNotes;
    }
    
    // Update price and related fields if provided
    if (price !== undefined) {
      booking.price = Number(price);
      if (paidAmount !== undefined) booking.paidAmount = Number(paidAmount);
      if (remainingBalance !== undefined) booking.remainingBalance = Number(remainingBalance);
    }

    await booking.save();

    const updatedBooking = await Booking.findById(id).populate(
      "assignedSupervisor",
      "name email phone position"
    );

    console.log(`✅ Payment status updated successfully!`);
    console.log(`   New Payment Status: ${updatedBooking.paymentStatus}`);

    return res.status(200).json({
      success: true,
      message: `Payment ${paymentStatus === "Approved" ? "approved" : paymentStatus === "Rejected" ? "rejected" : "updated"} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ✅ UPDATE BOOKING STATUS (FOR SERVICE MANAGER)
// =====================================
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    console.log(`📋 Service Manager updating booking status for ${id}`);
    console.log(`   Booking Status: ${status}`);
    console.log(`   Notes: ${notes || 'No notes'}`);

    const booking = await Booking.findById(id);

    if (!booking) {
      console.log(`❌ Booking not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate status
    if (status && !["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: Pending, Approved, Rejected, or Cancelled",
      });
    }

    // Update booking status
    if (status) {
      booking.status = status;
      
      if (status === "Approved" && !booking.approvedAt) {
        booking.approvedAt = new Date();
        // Only set workStatus to Assigned if payment is already approved
        if (booking.paymentStatus === "Approved") {
          booking.workStatus = "Assigned";
        }
      }
      
      if (status === "Rejected" && !booking.rejectedAt) {
        booking.rejectedAt = new Date();
      }
    }

    if (notes !== undefined) {
      booking.bookingNotes = notes;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(id).populate(
      "assignedSupervisor",
      "name email phone position"
    );

    console.log(`✅ Booking status updated successfully!`);
    console.log(`   New Status: ${updatedBooking.status}`);

    return res.status(200).json({
      success: true,
      message: `Booking ${status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : "updated"} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ⭐ ASSIGN SUPERVISOR
// =====================================
const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.body;
    const { id } = req.params;

    console.log(`📝 Assigning supervisor ${supervisorId} to booking ${id}`);

    if (!supervisorId) {
      return res.status(400).json({
        success: false,
        message: "Supervisor ID is required",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be assigned a supervisor",
      });
    }

    if (booking.paymentStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Payment must be approved before assigning a supervisor",
      });
    }

    booking.assignedSupervisor = supervisorId;
    booking.workStatus = "Assigned";
    booking.assignedAt = new Date();

    await booking.save();

    const updated = await Booking.findById(booking._id).populate(
      "assignedSupervisor",
      "name email phone position"
    );

    console.log(`✅ Supervisor assigned successfully`);

    return res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("❌ Error assigning supervisor:", error);
    return res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: error.message,
    });
  }
};

// =====================================
// ⭐ UPDATE WORK STATUS
// =====================================
const updateWorkStatus = async (req, res) => {
  try {
    const { workStatus } = req.body;
    const { id } = req.params;

    console.log(`📝 Updating work status for booking ${id} to: ${workStatus}`);

    const allowed = ["Assigned", "Ongoing", "Completed"];

    if (!allowed.includes(workStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid work status. Must be: Assigned, Ongoing, or Completed",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.workStatus = workStatus;
    
    if (workStatus === "Ongoing" && !booking.startedAt) {
      booking.startedAt = new Date();
    }
    
    if (workStatus === "Completed") {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updated = await Booking.findById(booking._id).populate(
      "assignedSupervisor",
      "name email phone position"
    );

    console.log(`✅ Work status updated to: ${workStatus}`);

    return res.status(200).json({
      success: true,
      message: `Work status updated to ${workStatus}`,
      booking: updated,
    });
  } catch (error) {
    console.error("❌ Error updating work status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ✅ DELETE BOOKING
// =====================================
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 Deleting booking: ${id}`);

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log(`✅ Booking deleted: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getSupervisorBookings,
  getUserBookings,
  getSingleBooking,
  updatePaymentStatus,      // For Finance - updates payment status
  updateBookingStatus,      // For Service Manager - updates booking status
  deleteBooking,
  assignSupervisor,
  updateWorkStatus,
};