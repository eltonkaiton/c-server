const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check route (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.status(200).send("Casino Night Rentals Backend is running 🚀");
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/supervisors", require("./routes/supervisorRoutes"));
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", require("./routes/supplierRoutes"));
app.use("/api/chat", require("./routes/chatRoutes")); // Added chat routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

// 🔥 IMPORTANT: Safe MongoDB + server start
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`📦 Inventory API: /api/inventory`);
      console.log(`💰 Finance API: /api/finance`);
      console.log(`📋 Supplier API: /api/supplier`);
      console.log(`💬 Chat API: /api/chat`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
}

startServer();