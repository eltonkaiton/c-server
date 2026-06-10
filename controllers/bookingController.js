const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// =====================================
// ✅ CREATE BOOKING (FULLY UPDATED)
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
      basePrice,
      price,
      eventDate,
      eventTime,
      location,
      county,
      city,
      venue,
      guests,
      specialRequests,
      eventDuration,
      dealersNeeded,
      dealerCost,
      transportFee,
      accommodationFee,
      subtotal,
      serviceFee,
      totalAmount,
      durationMultiplier,
      paymentMethod,
      paymentStatus,
      transactionCode,
      mpesaReceiptNumber,
      mpesaPhoneNumber,
      mpesaAmount,
      paidAmount,
      remainingBalance,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    if (!customerName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Customer name, email, and phone are required" });
    }

    const finalBasePrice = basePrice || price || 0;
    const finalDealersNeeded = dealersNeeded || 1;
    const finalDealerCost = dealerCost || (finalDealersNeeded * 2000);
    const finalDurationMultiplier = durationMultiplier || 1;
    const finalTransportFee = transportFee || 0;
    const finalAccommodationFee = accommodationFee || 0;
    
    let finalSubtotal = subtotal || ((finalBasePrice + finalDealerCost) * finalDurationMultiplier);
    let finalServiceFee = serviceFee || (finalSubtotal * 0.05);
    let finalTotalAmount = totalAmount || (finalSubtotal + finalServiceFee + finalTransportFee + finalAccommodationFee);
    const finalPaidAmount = paidAmount || finalTotalAmount;
    const finalRemainingBalance = remainingBalance !== undefined ? remainingBalance : finalTotalAmount - finalPaidAmount;

    const bookingData = {
      userId: new mongoose.Types.ObjectId(userId),
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      gameId: gameId || "",
      gameTitle: gameTitle || "",
      basePrice: finalBasePrice,
      price: finalBasePrice,
      eventDate: eventDate || "",
      eventTime: eventTime || "",
      location: location || venue || "",
      county: county || "",
      city: city || "",
      venue: venue || "",
      guests: guests ? parseInt(guests) : 1,
      specialRequests: specialRequests || "",
      eventDuration: eventDuration || "4 Hours",
      dealersNeeded: finalDealersNeeded,
      dealerCost: finalDealerCost,
      transportFee: finalTransportFee,
      accommodationFee: finalAccommodationFee,
      subtotal: finalSubtotal,
      serviceFee: finalServiceFee,
      totalAmount: finalTotalAmount,
      durationMultiplier: finalDurationMultiplier,
      status: "Pending",
      workStatus: "Unassigned",
      paymentMethod: paymentMethod || "M-Pesa",
      paymentStatus: paymentStatus || "Pending",
      transactionCode: transactionCode ? transactionCode.toUpperCase().trim() : "",
      mpesaReceiptNumber: mpesaReceiptNumber || "",
      mpesaPhoneNumber: mpesaPhoneNumber || phone,
      mpesaAmount: mpesaAmount || finalTotalAmount,
      paidAmount: finalPaidAmount,
      remainingBalance: finalRemainingBalance,
      notes: notes || "",
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("❌ Booking creation failed:", error);
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
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position")
      .populate("assignedDealers", "name email phone position");

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

    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return res.status(400).json({ success: false, message: "Invalid supervisor ID format" });
    }

    const bookings = await Booking.find({ assignedSupervisor: supervisorId })
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position")
      .populate("assignedDealers", "name email phone position")
      .sort({ createdAt: -1 });

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
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
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
    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("assignedSupervisor", "name email phone position")
      .populate("assignedDealers", "name email phone position");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

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
    const { paymentStatus, paymentNotes, paidAmount, remainingBalance } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const validStatuses = ["Pending", "Processing", "Approved", "Paid", "Failed", "Refunded"];
    if (paymentStatus && !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid paymentStatus" });
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
      
      if (paymentStatus === "Approved" && !booking.paymentApprovedAt) {
        booking.paymentApprovedAt = new Date();
        if (booking.status === "Approved") {
          booking.workStatus = "Assigned";
        }
      }
      
      if (paymentStatus === "Paid" && !booking.paymentCompletedAt) {
        booking.paymentCompletedAt = new Date();
      }
      
      if (paymentStatus === "Failed" && !booking.paymentRejectedAt) {
        booking.paymentRejectedAt = new Date();
      }
    }

    if (paymentNotes !== undefined) booking.paymentNotes = paymentNotes;
    if (paidAmount !== undefined) booking.paidAmount = paidAmount;
    if (remainingBalance !== undefined) booking.remainingBalance = remainingBalance;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Payment ${paymentStatus} successfully`,
      booking,
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

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const validStatuses = ["Pending", "Approved", "Rejected", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (status) {
      booking.status = status;
      
      if (status === "Approved" && !booking.approvedAt) {
        booking.approvedAt = new Date();
        if (booking.paymentStatus === "Approved") {
          booking.workStatus = "Assigned";
        }
      }
      
      if (status === "Rejected" && !booking.rejectedAt) {
        booking.rejectedAt = new Date();
      }
      
      if (status === "Cancelled") {
        booking.workStatus = "Unassigned";
      }
    }

    if (notes !== undefined) booking.bookingNotes = notes;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
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

    if (!supervisorId) {
      return res.status(400).json({ success: false, message: "Supervisor ID is required" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Only approved bookings can be assigned a supervisor" });
    }

    if (booking.paymentStatus !== "Approved") {
      return res.status(400).json({ success: false, message: "Payment must be approved before assigning a supervisor" });
    }

    booking.assignedSupervisor = supervisorId;
    booking.workStatus = "Assigned";
    booking.assignedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      booking,
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
// ⭐ ASSIGN DEALERS
// =====================================
const assignDealers = async (req, res) => {
  try {
    const { dealerIds } = req.body;
    const { id } = req.params;

    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return res.status(400).json({ success: false, message: "Dealer IDs are required" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.assignedDealers = dealerIds;
    booking.dealersAssignedAt = new Date();
    
    if (booking.workStatus === "Assigned") {
      booking.workStatus = "Preparing";
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Dealers assigned successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error assigning dealers:", error);
    return res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: error.message,
    });
  }
};

// =====================================
// ⭐ UPDATE WORK STATUS (ENHANCED)
// =====================================
const updateWorkStatus = async (req, res) => {
  try {
    const { workStatus, notes } = req.body;
    const { id } = req.params;

    const allowed = [
      "Unassigned", "Assigned", "Preparing", "On Route", 
      "Setup Complete", "Event Ongoing", "Completed", 
      "Customer Confirmed", "Disputed", "Closed"
    ];
    
    if (!allowed.includes(workStatus)) {
      return res.status(400).json({ success: false, message: "Invalid work status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.workStatus = workStatus;
    
    if (workStatus === "Preparing" && !booking.startedAt) {
      booking.startedAt = new Date();
    }
    
    if (workStatus === "Completed") {
      booking.completedAt = new Date();
    }
    
    if (workStatus === "Customer Confirmed") {
      booking.customerConfirmed = true;
      booking.customerConfirmedAt = new Date();
    }
    
    if (workStatus === "Closed") {
      booking.closedAt = new Date();
    }
    
    if (workStatus === "On Route" && !booking.departureTime) {
      booking.departureTime = new Date();
    }
    
    if (workStatus === "Setup Complete" && !booking.setupCompletedAt) {
      booking.setupCompletedAt = new Date();
    }
    
    if (workStatus === "Setup Complete" && !booking.arrivalTime) {
      booking.arrivalTime = new Date();
    }
    
    if (notes) {
      booking.internalNotes = notes;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Work status updated to ${workStatus}`,
      booking,
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
// ⭐ SUBMIT RATING AND FEEDBACK (CUSTOMER) - FIXED
// =====================================
const submitRatingAndFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Allow rating when workStatus is "Completed" OR "Customer Confirmed"
    if (booking.workStatus !== "Completed" && booking.workStatus !== "Customer Confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: "Event is not ready for rating. Current status: " + booking.workStatus
      });
    }

    if (booking.customerRating) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already rated this event" 
      });
    }

    if (rating && rating >= 1 && rating <= 5) {
      booking.customerRating = rating;
    } else {
      return res.status(400).json({ success: false, message: "Please provide a valid rating (1-5)" });
    }
    
    if (feedback) {
      booking.customerFeedback = feedback;
    }

    // Mark as confirmed and update workStatus
    booking.customerConfirmed = true;
    booking.customerConfirmedAt = new Date();
    booking.workStatus = "Customer Confirmed";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Thank you for your feedback!",
      booking,
    });
  } catch (error) {
    console.error("❌ Error submitting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ⭐ UPDATE LOGISTICS
// =====================================
const updateLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { departureTime, arrivalTime, setupCompletedAt } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (departureTime) booking.departureTime = new Date(departureTime);
    if (arrivalTime) booking.arrivalTime = new Date(arrivalTime);
    if (setupCompletedAt) booking.setupCompletedAt = new Date(setupCompletedAt);

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Logistics updated successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error updating logistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =====================================
// ⭐ UPDATE FINANCE STATUS
// =====================================
const updateFinanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { financeStatus, financeApprovedBy } = req.body;

    const validStatuses = ["Not Required", "Pending Approval", "Approved", "Payment Processing", "Paid", "Rejected"];
    if (!validStatuses.includes(financeStatus)) {
      return res.status(400).json({ success: false, message: "Invalid finance status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.financeStatus = financeStatus;
    
    if (financeStatus === "Approved") {
      booking.financeApprovedAt = new Date();
      if (financeApprovedBy) booking.financeApprovedBy = financeApprovedBy;
    }

    if (financeStatus === "Paid" && booking.workStatus === "Customer Confirmed") {
      booking.workStatus = "Closed";
      booking.closedAt = new Date();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Finance status updated to ${financeStatus}`,
      booking,
    });
  } catch (error) {
    console.error("❌ Error updating finance status:", error);
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
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

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

// =====================================
// ✅ GET BOOKING STATISTICS
// =====================================
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const approvedBookings = await Booking.countDocuments({ status: "Approved" });
    const completedBookings = await Booking.countDocuments({ workStatus: "Completed" });
    const customerConfirmed = await Booking.countDocuments({ customerConfirmed: true });
    const customerRated = await Booking.countDocuments({ customerRating: { $ne: null } });
    
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const averageRating = await Booking.aggregate([
      { $match: { customerRating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$customerRating" } } }
    ]);
    
    const workStatusStats = await Booking.aggregate([
      { $group: { _id: "$workStatus", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        completedBookings,
        customerConfirmed,
        customerRated,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRating: averageRating[0]?.avg || 0,
        workStatusStats,
      }
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
  submitRatingAndFeedback,
  updateLogistics,
  updateFinanceStatus,
  getBookingStats,
};