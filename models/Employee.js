const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      enum: [
        "Administrator",
        "Finance",
        "Supervisor",
        "Inventory",
        "Service Manager",
        "Supplier",
      ],
      default: "Administrator",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);