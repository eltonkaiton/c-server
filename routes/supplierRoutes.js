const express = require("express");
const router = express.Router();
const {
  supplierLogin,
  getSupplierProfile,
  getSupplierOrders,
  updateOrderStatus,
  getSupplierStats,
  bulkUpdateOrderStatus,
  addTrackingNumber,
} = require("../controllers/supplierController");

// Public routes
router.post("/login", supplierLogin);

// Protected routes (token in body)
router.post("/profile", getSupplierProfile);
router.post("/orders", getSupplierOrders);
router.post("/stats", getSupplierStats);
router.post("/orders/:id/status", updateOrderStatus);
router.post("/orders/:id/tracking", addTrackingNumber);
router.post("/orders/bulk-update", bulkUpdateOrderStatus);

module.exports = router;