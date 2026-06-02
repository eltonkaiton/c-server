const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Equipment", "Consumables", "Furniture", "Electronics", "Other"],
    },
    sku: {
      type: String,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      default: "pcs",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIXED SKU GENERATOR (NO next)
inventorySchema.pre("save", async function () {
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    this.sku = `${categoryCode}-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model("Inventory", inventorySchema);