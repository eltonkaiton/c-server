const Employee = require("../models/Employee");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Supplier Login
const supplierLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const supplier = await Employee.findOne({ email, position: "Supplier" });

    if (!supplier) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or not a supplier account",
      });
    }

    const isMatch = await bcrypt.compare(password, supplier.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: supplier._id, position: supplier.position },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        position: supplier.position,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Supplier Profile (using token from body)
const getSupplierProfile = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplier = await Employee.findById(decoded.id).select("-password");

    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }

    res.json({
      success: true,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Orders for Supplier (using token from body)
const getSupplierOrders = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const supplier = await Employee.findById(supplierId);
    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }
    
    const orders = await Order.find({ supplierId })
      .populate("items.itemId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching supplier orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Order Status (using token from body)
const updateOrderStatus = async (req, res) => {
  try {
    const { token, status, trackingNumber, estimatedDeliveryDate } = req.body;
    const orderId = req.params.id;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const supplier = await Employee.findById(supplierId);
    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }

    const order = await Order.findOne({ _id: orderId, supplierId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    // Define valid status transitions
    const validTransitions = {
      "Pending": ["Processing", "Cancelled"],
      "Processing": ["Shipped", "Cancelled"],
      "Shipped": ["Out for Delivery", "Delivered", "Cancelled"],
      "Out for Delivery": ["Delivered", "Cancelled"],
      "Delivered": ["Completed"],
      "Completed": [],
      "Cancelled": [],
    };

    // Check if status transition is valid
    if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    // Update order fields based on status
    order.status = status;
    
    // Add tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // Set estimated delivery date when processing
    if (status === "Processing" && !order.estimatedDeliveryDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days delivery estimate
      order.estimatedDeliveryDate = estimatedDeliveryDate || deliveryDate;
    }
    
    // Set actual delivery date when delivered
    if (status === "Delivered") {
      order.actualDeliveryDate = new Date();
    }
    
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        actualDeliveryDate: order.actualDeliveryDate,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Order Statistics for Supplier Dashboard
const getSupplierStats = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const supplier = await Employee.findById(supplierId);
    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }
    
    const orders = await Order.find({ supplierId });
    
    const stats = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: orders.filter(o => o.status === "Pending").length,
      processingOrders: orders.filter(o => o.status === "Processing").length,
      shippedOrders: orders.filter(o => o.status === "Shipped").length,
      outForDeliveryOrders: orders.filter(o => o.status === "Out for Delivery").length,
      deliveredOrders: orders.filter(o => o.status === "Delivered").length,
      completedOrders: orders.filter(o => o.status === "Completed").length,
      cancelledOrders: orders.filter(o => o.status === "Cancelled").length,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching supplier stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk Update Order Status (for multiple orders)
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { token, orderIds, status } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const supplier = await Employee.findById(supplierId);
    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds }, supplierId },
      { status }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders updated to ${status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error bulk updating orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Tracking Number to Order
const addTrackingNumber = async (req, res) => {
  try {
    const { token, trackingNumber } = req.body;
    const orderId = req.params.id;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const supplier = await Employee.findById(supplierId);
    if (!supplier || supplier.position !== "Supplier") {
      return res.status(401).json({
        success: false,
        message: "Not authorized as supplier",
      });
    }

    const order = await Order.findOne({ _id: orderId, supplierId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    order.trackingNumber = trackingNumber;
    await order.save();

    res.json({
      success: true,
      message: "Tracking number added successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    console.error("Error adding tracking number:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  supplierLogin,
  getSupplierProfile,
  getSupplierOrders,
  updateOrderStatus,
  getSupplierStats,
  bulkUpdateOrderStatus,
  addTrackingNumber,
};