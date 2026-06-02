const express = require("express");
const router = express.Router();
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getInventorySummary,
  getOrders,
  createOrder,
  updateOrderStatus,
} = require("../controllers/inventoryController");

// IMPORTANT: All routes are relative to /api/inventory

// =====================================
// INVENTORY ROUTES
// =====================================

// Get all items & Create new item
router.route("/items")
  .get(getInventoryItems)
  .post(createInventoryItem);

// Get inventory summary/stats
router.get("/summary", getInventorySummary);

// Get single item, update, delete
router.route("/items/:id")
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

// Update stock quantity
router.patch("/items/:id/stock", updateStock);

// =====================================
// ORDER ROUTES
// =====================================

// Get all orders & Create new order
router.route("/orders")
  .get(getOrders)
  .post(createOrder);

// Update order status
router.patch("/orders/:id/status", updateOrderStatus);

// =====================================
// TEST ROUTE
// =====================================
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Inventory routes are working!" });
});

module.exports = router;