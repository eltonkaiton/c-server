const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const inventoryRoutes = require("./routes/inventoryRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Test route
app.get("/", (req, res) => {
  res.send("Casino Night Rentals Backend is running 🚀");
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

// Global error handler (CATCHES all errors)
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
      console.log(`💰 Finance API: http://localhost:${PORT}/api/finance`);
      console.log(`📋 Supplier API: http://localhost:${PORT}/api/supplier`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error ❌");
    console.log(err);
  });