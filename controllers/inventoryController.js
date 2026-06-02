const Inventory = require("../models/Inventory");
const Order = require("../models/Order");

// =====================================
// CREATE INVENTORY ITEM
// =====================================
const createInventoryItem = async (req, res) => {
  try {
    console.log("📦 Received data:", req.body);
    
    const {
      name,
      category,
      quantity,
      unit,
      price,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    const item = new Inventory({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      unit: unit || "pcs",
      price: Number(price),
      description: description?.trim() || "",
    });

    await item.save();
    
    console.log("✅ Item created:", item.sku);

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      item: {
        _id: item._id,
        name: item.name,
        category: item.category,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        description: item.description,
        createdAt: item.createdAt,
        totalValue: item.quantity * item.price,
      },
    });
  } catch (error) {
    console.error("❌ Create inventory error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists. Please try again.",
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error while creating inventory item",
      error: error.message,
    });
  }
};

// =====================================
// GET ALL INVENTORY ITEMS
// =====================================
const getInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    
    const transformedItems = items.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      totalValue: item.quantity * item.price,
      stockStatus: item.quantity === 0 ? "Out of Stock" : item.quantity < 10 ? "Low Stock" : "In Stock"
    }));
    
    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      lowStock: items.filter(item => item.quantity > 0 && item.quantity < 10).length,
      outOfStock: items.filter(item => item.quantity === 0).length,
    };
    
    res.json({ 
      success: true, 
      items: transformedItems,
      stats,
      count: items.length
    });
  } catch (error) {
    console.error("Error getting inventory:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching inventory items",
      error: error.message 
    });
  }
};

// =====================================
// GET SINGLE INVENTORY ITEM
// =====================================
const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    res.json({ 
      success: true, 
      item: {
        _id: item._id,
        name: item.name,
        category: item.category,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        totalValue: item.quantity * item.price,
      }
    });
  } catch (error) {
    console.error("Error getting item:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching item",
      error: error.message 
    });
  }
};

// =====================================
// UPDATE INVENTORY ITEM
// =====================================
const updateInventoryItem = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      price,
      description,
    } = req.body;
    
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (price !== undefined) item.price = Number(price);
    if (description !== undefined) item.description = description.trim();
    
    await item.save();
    
    res.json({ 
      success: true, 
      item: {
        _id: item._id,
        name: item.name,
        category: item.category,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        description: item.description,
        totalValue: item.quantity * item.price,
      },
      message: "Item updated successfully" 
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating item",
      error: error.message 
    });
  }
};

// =====================================
// DELETE INVENTORY ITEM
// =====================================
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: `Item "${item.name}" deleted successfully` 
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting item",
      error: error.message 
    });
  }
};

// =====================================
// UPDATE STOCK QUANTITY
// =====================================
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = "set" } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }
    
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    let newQuantity;
    switch (operation) {
      case "add":
        newQuantity = item.quantity + Number(quantity);
        break;
      case "subtract":
        newQuantity = item.quantity - Number(quantity);
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock",
          });
        }
        break;
      default:
        newQuantity = Number(quantity);
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: "Quantity cannot be negative",
          });
        }
    }
    
    item.quantity = newQuantity;
    await item.save();
    
    res.json({ 
      success: true, 
      item: {
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      },
      message: `Stock updated to ${newQuantity} ${item.unit}` 
    });
  } catch (error) {
    console.error("Stock update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating stock",
      error: error.message 
    });
  }
};

// =====================================
// GET INVENTORY SUMMARY
// =====================================
const getInventorySummary = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    const summary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      averagePrice: items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0,
      stockStatus: {
        inStock: items.filter(item => item.quantity > 10).length,
        lowStock: items.filter(item => item.quantity > 0 && item.quantity <= 10).length,
        outOfStock: items.filter(item => item.quantity === 0).length,
      },
      categories: {}
    };
    
    items.forEach(item => {
      if (!summary.categories[item.category]) {
        summary.categories[item.category] = {
          count: 0,
          totalValue: 0
        };
      }
      summary.categories[item.category].count++;
      summary.categories[item.category].totalValue += item.price * item.quantity;
    });
    
    res.json({ success: true, summary });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error generating summary",
      error: error.message 
    });
  }
};

// =====================================
// GET ALL ORDERS
// =====================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.itemId")
      .populate("supplierId", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};

// =====================================
// CREATE ORDER
// =====================================
const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      orderType,
      supplier,
      supplierId,
      supplierEmail,
      supplierPhone,
      customer,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
      paymentMethod,
      paymentStatus,
      transactionCode,
      paidAmount,
      remainingBalance,
    } = req.body;
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const count = await Order.countDocuments();
    const sequence = String(count + 1).padStart(4, "0");
    const orderNumber = `ORD-${year}${month}${day}-${sequence}`;
    
    const orderData = {
      orderNumber,
      items,
      totalAmount,
      orderType,
      supplier: supplier || "",
      supplierId: supplierId || null,
      supplierEmail: supplierEmail || "",
      supplierPhone: supplierPhone || "",
      customer: customer || "",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      shippingAddress: shippingAddress || "",
      notes: notes || "",
      paymentMethod: paymentMethod || "M-Pesa",
      paymentStatus: paymentStatus || "Pending",
      transactionCode: transactionCode || "",
      paidAmount: paidAmount || 0,
      remainingBalance: remainingBalance || totalAmount,
      status: "Pending",
    };
    
    const order = new Order(orderData);
    await order.save();
    
    for (const item of order.items) {
      const inventoryItem = await Inventory.findById(item.itemId);
      if (inventoryItem) {
        if (order.orderType === "Purchase") {
          inventoryItem.quantity += item.quantity;
        } else if (order.orderType === "Sale") {
          inventoryItem.quantity -= item.quantity;
        }
        await inventoryItem.save();
      }
    }
    
    res.status(201).json({ 
      success: true, 
      order, 
      message: "Order created successfully" 
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order",
      error: error.message 
    });
  }
};

// =====================================
// UPDATE ORDER STATUS (Can update both status and paymentStatus)
// =====================================
const updateOrderStatus = async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus, 
      paymentSent, 
      paymentSentDate, 
      notes,
      trackingNumber,
      estimatedDeliveryDate,
      actualDeliveryDate 
    } = req.body;
    
    const updateData = {};
    
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentSent !== undefined) updateData.paymentSent = paymentSent;
    if (paymentSentDate !== undefined) updateData.paymentSentDate = paymentSentDate;
    if (notes !== undefined) updateData.notes = notes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate !== undefined) updateData.estimatedDeliveryDate = estimatedDeliveryDate;
    if (actualDeliveryDate !== undefined) updateData.actualDeliveryDate = actualDeliveryDate;
    
    // Auto-set timestamps based on status changes
    if (status === "Delivered" && !actualDeliveryDate) {
      updateData.actualDeliveryDate = new Date();
    }
    
    if (paymentStatus === "Approved") {
      updateData.paymentApprovedAt = new Date();
    }
    
    if (paymentStatus === "Paid") {
      updateData.paymentCompletedAt = new Date();
      updateData.paymentSent = true;
      updateData.paymentSentDate = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    res.json({ 
      success: true, 
      order, 
      message: "Order updated successfully" 
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating order",
      error: error.message 
    });
  }
};

// =====================================
// UPDATE ORDER PAYMENT STATUS
// =====================================
const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentNotes, paidAmount, remainingBalance } = req.body;
    const { id } = req.params;
    
    const updateData = {
      paymentStatus,
      paymentNotes: paymentNotes || "",
    };
    
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (remainingBalance !== undefined) updateData.remainingBalance = remainingBalance;
    
    if (paymentStatus === "Paid") {
      updateData.paymentSent = true;
      updateData.paymentSentDate = new Date();
      updateData.paymentCompletedAt = new Date();
    }
    
    if (paymentStatus === "Approved") {
      updateData.paymentApprovedAt = new Date();
    }
    
    if (paymentStatus === "Refunded") {
      updateData.paymentRefundedAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    res.json({ 
      success: true, 
      order, 
      message: `Payment status updated to ${paymentStatus}` 
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating payment status",
      error: error.message 
    });
  }
};

// =====================================
// GET ORDERS BY SUPPLIER
// =====================================
const getOrdersBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const orders = await Order.find({ supplierId })
      .populate("items.itemId")
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Orders by supplier error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};

// =====================================
// GET ORDERS BY DATE RANGE
// =====================================
const getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate("items.itemId")
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Orders by date error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};

module.exports = {
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
  updateOrderPaymentStatus,
  getOrdersBySupplier,
  getOrdersByDateRange,
};