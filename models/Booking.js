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

    customerName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // ======================
    // GAME INFO
    // ======================
    gameId: { type: String, trim: true },
    gameTitle: { type: String, trim: true },
    price: { type: Number, default: 0 },

    // ======================
    // EVENT INFO
    // ======================
    eventDate: String,
    location: String,
    guests: { type: Number, default: 1 },

    // ======================
    // SERVICE MANAGER STATUS
    // ======================
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // ======================
    // PAYMENT STATUS (FINANCE)
    // ======================
    paymentStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
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

    assignedAt: {
      type: Date,
      default: null,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================
    // WORKFLOW STATUS
    // ======================
    workStatus: {
      type: String,
      enum: ["Unassigned", "Assigned", "Ongoing", "Completed"],
      default: "Unassigned",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // ======================
    // TRANSACTION INFO
    // ======================
    transactionCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    mpesaReceiptNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    mpesaPhoneNumber: String,
    mpesaAmount: { type: Number, default: 0 },

    // ======================
    // PAYMENT TRACKING
    // ======================
    paidAmount: {
      type: Number,
      default: 0,
    },

    remainingBalance: {
      type: Number,
      default: 0,
    },

    paymentApprovedAt: Date,
    paymentConfirmationDate: Date,
    paymentNotes: String,
  },
  {
    timestamps: true,
  }
);

// ======================
// INDEXES (PERFORMANCE)
// ======================
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ workStatus: 1 });
bookingSchema.index({ assignedSupervisor: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);