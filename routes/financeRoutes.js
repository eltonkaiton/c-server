const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Create finance order record
router.post("/orders", async (req, res) => {
  try {
    const { orderId, orderNumber, totalAmount, supplier, items, orderDate } = req.body;
    
    console.log("💰 Payment request received:");
    console.log("Order Number:", orderNumber);
    console.log("Amount:", totalAmount);
    console.log("Supplier:", supplier);
    console.log("Items:", items.length);
    
    // You can create a Finance model and save to database here
    // For now, just return success
    
    res.json({
      success: true,
      message: "Order sent to finance successfully",
      data: {
        orderId,
        orderNumber,
        totalAmount,
        supplier,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Error sending to finance:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all finance transactions (optional)
router.get("/transactions", async (req, res) => {
  try {
    // This would fetch from a Finance collection
    // For now, return empty array
    res.json({
      success: true,
      transactions: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;