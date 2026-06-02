const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  },
  name: String,
  quantity: Number,
  price: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["Purchase", "Sale", "Return", "Adjustment"],
      required: true,
    },
    supplier: {
      type: String,
      default: "",
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    supplierEmail: {
      type: String,
      default: "",
    },
    supplierPhone: {
      type: String,
      default: "",
    },
    customer: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    customerPhone: {
      type: String,
      default: "",
    },
    shippingAddress: {
      type: String,
      default: "",
    },
    trackingNumber: {
      type: String,
      default: "",
      index: true,
    },
    // Order Status (Delivery/Shipping Status)
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Received",
        "Completed",
        "Cancelled"
      ],
      default: "Pending",
      index: true,
    },
    // Payment Status Field
    paymentStatus: {
      type: String,
      enum: [
        "Pending",      // Payment not yet processed
        "Processing",   // Payment being processed
        "Approved",     // Payment approved by finance
        "Paid",         // Payment received
        "Failed",       // Payment failed
        "Refunded",     // Payment refunded
        "Cancelled"     // Payment cancelled
      ],
      default: "Pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "Pending", "Processing", "Shipped", "Out for Delivery",
            "Delivered", "Received", "Completed", "Cancelled"
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    internalNotes: {
      type: String,
      default: "",
    },
    paymentSent: {
      type: Boolean,
      default: false,
    },
    paymentSentDate: {
      type: Date,
      default: null,
    },
  },
  { 
    timestamps: true,
    indexes: [
      { supplierId: 1, status: 1, createdAt: -1 }
    ]
  }
);

// Generate order number before saving
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const count = await mongoose.model("Order").countDocuments();
    const sequence = String(count + 1).padStart(4, "0");
    this.orderNumber = `ORD-${year}${month}${day}-${sequence}`;
  }
  
  // Add to status history if status changed
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`,
    });
    
    // Set actual delivery date when status becomes Delivered
    if (this.status === "Delivered" && !this.actualDeliveryDate) {
      this.actualDeliveryDate = new Date();
    }
    
    // Set payment sent date when status is Completed
    if (this.status === "Completed" && !this.paymentSentDate) {
      this.paymentSent = true;
      this.paymentSentDate = new Date();
    }
  }
  
  // Auto-update paymentSent based on paymentStatus
  if (this.isModified("paymentStatus")) {
    if (this.paymentStatus === "Paid" && !this.paymentSentDate) {
      this.paymentSent = true;
      this.paymentSentDate = new Date();
    }
    if (this.paymentStatus === "Refunded") {
      this.paymentSent = false;
    }
  }
});

// Virtual for delivery progress percentage
orderSchema.virtual("deliveryProgress").get(function () {
  const statusOrder = {
    "Pending": 0,
    "Processing": 25,
    "Shipped": 50,
    "Out for Delivery": 75,
    "Delivered": 90,
    "Received": 95,
    "Completed": 100,
    "Cancelled": 0,
  };
  return statusOrder[this.status] || 0;
});

// Virtual for days since order placed
orderSchema.virtual("daysSinceOrder").get(function () {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for payment status display (with emoji)
orderSchema.virtual("paymentStatusDisplay").get(function () {
  const statusMap = {
    "Pending": "⏳ Pending",
    "Processing": "🔄 Processing",
    "Approved": "✅ Approved",
    "Paid": "💰 Paid",
    "Failed": "❌ Failed",
    "Refunded": "↩️ Refunded",
    "Cancelled": "🚫 Cancelled",
  };
  return statusMap[this.paymentStatus] || "⏳ Pending";
});

// Virtual for payment status color
orderSchema.virtual("paymentStatusColor").get(function () {
  const colorMap = {
    "Pending": "#F59E0B",
    "Processing": "#3B82F6",
    "Approved": "#8B5CF6",
    "Paid": "#10B981",
    "Failed": "#EF4444",
    "Refunded": "#F97316",
    "Cancelled": "#6B7280",
  };
  return colorMap[this.paymentStatus] || "#F59E0B";
});

// Virtual for payment progress percentage
orderSchema.virtual("paymentProgress").get(function () {
  const progressMap = {
    "Pending": 0,
    "Processing": 25,
    "Approved": 50,
    "Paid": 100,
    "Failed": 0,
    "Refunded": 100,
    "Cancelled": 0,
  };
  return progressMap[this.paymentStatus] || 0;
});

// Ensure virtuals are included in JSON output
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);