const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ======================
    // USER INFO
    // ======================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true, required: true },

    // ======================
    // GAME/PACKAGE INFO
    // ======================
    gameId: { type: String, trim: true },
    gameTitle: { type: String, trim: true },
    basePrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },

    // ======================
    // EVENT INFO
    // ======================
    eventDate: { type: String, default: "" },
    eventTime: { type: String, default: "" },
    location: { type: String, default: "" },
    county: { type: String, default: "" },
    city: { type: String, default: "" },
    venue: { type: String, default: "" },
    guests: { type: Number, default: 1 },
    specialRequests: { type: String, default: "" },

    // ======================
    // BOOKING OPTIONS
    // ======================
    eventDuration: {
      type: String,
      enum: ["4 Hours", "8 Hours", "Full Day", "Weekend"],
      default: "4 Hours",
    },
    dealersNeeded: { type: Number, default: 1 },

    // ======================
    // PRICE BREAKDOWN
    // ======================
    dealerCost: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    accommodationFee: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    durationMultiplier: { type: Number, default: 1 },

    // ======================
    // STATUSES
    // ======================
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["M-Pesa", "Bank Transfer", "Cash", "Card", "PayPal"],
      default: "M-Pesa",
    },

    // ======================
    // SUPERVISOR ASSIGNMENT
    // ======================
    assignedSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedAt: { type: Date, default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ======================
    // WORKFLOW STATUS (ENHANCED)
    // ======================
    workStatus: {
      type: String,
      enum: [
        "Unassigned",
        "Assigned",
        "Preparing",
        "On Route",
        "Setup Complete",
        "Event Ongoing",
        "Completed",
        "Awaiting Customer Confirmation",
        "Customer Confirmed",
        "Disputed",
        "Closed"
      ],
      default: "Unassigned",
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // ======================
    // CUSTOMER CONFIRMATION
    // ======================
    customerConfirmed: {
      type: Boolean,
      default: false,
    },
    customerConfirmedAt: {
      type: Date,
      default: null,
    },
    customerFeedback: {
      type: String,
      default: "",
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    confirmationOTP: {
      type: String,
      default: "",
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpVerifiedAt: {
      type: Date,
      default: null,
    },

    // ======================
    // DEALER ASSIGNMENTS
    // ======================
    assignedDealers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    dealersAssignedAt: {
      type: Date,
      default: null,
    },

    // ======================
    // LOGISTICS / TRANSPORTATION TRACKING
    // ======================
    departureTime: {
      type: Date,
      default: null,
    },
    arrivalTime: {
      type: Date,
      default: null,
    },
    setupCompletedAt: {
      type: Date,
      default: null,
    },

    // ======================
    // FINANCE WORKFLOW
    // ======================
    financeStatus: {
      type: String,
      enum: [
        "Not Required",
        "Pending Approval",
        "Approved",
        "Payment Processing",
        "Paid",
        "Rejected"
      ],
      default: "Not Required",
    },
    financeApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    financeApprovedAt: {
      type: Date,
      default: null,
    },

    // ======================
    // EVENT CLOSURE
    // ======================
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================
    // TRANSACTION INFO
    // ======================
    transactionCode: { type: String, trim: true, uppercase: true },
    transactionId: { type: String, trim: true },
    mpesaReceiptNumber: { type: String, trim: true, uppercase: true },
    mpesaPhoneNumber: { type: String, trim: true },
    mpesaAmount: { type: Number, default: 0 },

    // ======================
    // PAYMENT TRACKING
    // ======================
    paidAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    paymentApprovedAt: { type: Date, default: null },
    paymentConfirmationDate: { type: Date, default: null },
    paymentCompletedAt: { type: Date, default: null },
    paymentRejectedAt: { type: Date, default: null },
    paymentNotes: { type: String, default: "" },

    // ======================
    // NOTES & HISTORY
    // ======================
    notes: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    bookingNotes: { type: String, default: "" },
    
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    
    paymentHistory: [
      {
        paymentStatus: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
        amount: { type: Number, default: 0 },
      },
    ],

    // ======================
    // WORKFLOW HISTORY TRACKING
    // ======================
    workStatusHistory: [
      {
        workStatus: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ======================
// VIRTUAL FIELDS
// ======================
bookingSchema.virtual("costBreakdown").get(function () {
  return {
    basePrice: this.basePrice || this.price,
    dealerCost: this.dealerCost,
    transportFee: this.transportFee,
    accommodationFee: this.accommodationFee,
    subtotal: this.subtotal,
    serviceFee: this.serviceFee,
    total: this.totalAmount,
  };
});

bookingSchema.virtual("progress").get(function () {
  if (this.workStatus === "Closed" || this.workStatus === "Customer Confirmed") return 100;
  if (this.workStatus === "Completed") return 90;
  if (this.workStatus === "Event Ongoing") return 75;
  if (this.workStatus === "Setup Complete") return 65;
  if (this.workStatus === "On Route") return 50;
  if (this.workStatus === "Preparing") return 40;
  if (this.workStatus === "Assigned") return 30;
  if (this.status === "Approved") return 20;
  if (this.status === "Pending") return 10;
  if (this.status === "Rejected") return 0;
  return 0;
});

bookingSchema.virtual("paymentProgress").get(function () {
  if (this.paymentStatus === "Paid") return 100;
  if (this.paymentStatus === "Approved") return 75;
  if (this.paymentStatus === "Processing") return 50;
  if (this.paymentStatus === "Failed") return 0;
  return 25;
});

bookingSchema.virtual("isEventReady").get(function () {
  return this.workStatus === "Setup Complete" || this.workStatus === "Event Ongoing";
});

bookingSchema.virtual("needsCustomerConfirmation").get(function () {
  return this.workStatus === "Awaiting Customer Confirmation" && !this.customerConfirmed;
});

// ======================
// MIDDLEWARE / HOOKS
// ======================
bookingSchema.pre("save", function () {
  // Calculate total amount if not set
  if (this.totalAmount === 0 && this.basePrice) {
    const base = this.basePrice || this.price || 0;
    const dealerCost = (this.dealersNeeded || 1) * 2000;
    const durationMult = this.durationMultiplier || 1;
    const subtotal = (base + dealerCost) * durationMult;
    const serviceFee = subtotal * 0.05;
    this.subtotal = subtotal;
    this.serviceFee = serviceFee;
    this.totalAmount = subtotal + serviceFee + (this.transportFee || 0) + (this.accommodationFee || 0);
    this.dealerCost = dealerCost;
  }
  
  // Set paid amount from total if not set
  if (this.paidAmount === 0 && this.totalAmount > 0) {
    this.paidAmount = this.totalAmount;
    this.remainingBalance = 0;
  }
  
  // Add to status history on status change
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`,
    });
  }
  
  // Add to payment history on paymentStatus change
  if (this.isModified("paymentStatus")) {
    this.paymentHistory.push({
      paymentStatus: this.paymentStatus,
      timestamp: new Date(),
      note: `Payment status changed to ${this.paymentStatus}`,
      amount: this.paidAmount,
    });
  }
  
  // Add to work status history on workStatus change
  if (this.isModified("workStatus")) {
    this.workStatusHistory.push({
      workStatus: this.workStatus,
      timestamp: new Date(),
      note: `Work status changed to ${this.workStatus}`,
    });
  }
  
  // Auto-set customer confirmed timestamp
  if (this.isModified("customerConfirmed") && this.customerConfirmed === true && !this.customerConfirmedAt) {
    this.customerConfirmedAt = new Date();
  }
  
  // Auto-set closed timestamp
  if (this.isModified("workStatus") && this.workStatus === "Closed" && !this.closedAt) {
    this.closedAt = new Date();
  }
});

// ======================
// INSTANCE METHODS
// ======================
bookingSchema.methods.updateWorkStatus = function(newStatus, userId, note = "") {
  this.workStatus = newStatus;
  this.workStatusHistory.push({
    workStatus: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: userId,
  });
  return this.save();
};

bookingSchema.methods.confirmEvent = function(otp, rating = null, feedback = "") {
  if (this.confirmationOTP === otp || !this.confirmationOTP) {
    this.customerConfirmed = true;
    this.customerConfirmedAt = new Date();
    if (rating) this.customerRating = rating;
    if (feedback) this.customerFeedback = feedback;
    this.otpVerified = true;
    this.otpVerifiedAt = new Date();
    this.workStatus = "Customer Confirmed";
    return true;
  }
  return false;
};

bookingSchema.methods.assignDealers = function(dealerIds) {
  this.assignedDealers = dealerIds;
  this.dealersAssignedAt = new Date();
  if (this.workStatus === "Assigned") {
    this.workStatus = "Preparing";
  }
  return this.save();
};

bookingSchema.methods.markFinanceApproved = function(financeId) {
  this.financeStatus = "Approved";
  this.financeApprovedBy = financeId;
  this.financeApprovedAt = new Date();
  return this.save();
};

// ======================
// STATIC METHODS
// ======================
bookingSchema.statics.getActiveEvents = function() {
  return this.find({
    workStatus: { $in: ["Assigned", "Preparing", "On Route", "Setup Complete", "Event Ongoing"] },
    status: "Approved",
  }).populate("assignedSupervisor assignedDealers");
};

bookingSchema.statics.getEventsNeedingConfirmation = function() {
  return this.find({
    workStatus: "Awaiting Customer Confirmation",
    customerConfirmed: false,
  });
};

// ======================
// INDEXES (PERFORMANCE)
// ======================
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ workStatus: 1 });
bookingSchema.index({ assignedSupervisor: 1 });
bookingSchema.index({ assignedDealers: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ county: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ assignedSupervisor: 1, workStatus: 1 });
bookingSchema.index({ county: 1, status: 1 });
bookingSchema.index({ eventDate: 1, status: 1 });
bookingSchema.index({ financeStatus: 1 });
bookingSchema.index({ customerConfirmed: 1 });
bookingSchema.index({ confirmationOTP: 1 });
bookingSchema.index({ closedAt: 1 });

// ======================
// OPTIONS
// ======================
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);