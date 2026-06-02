const Payment = require("../models/Payment");

// ===============================
// CREATE PAYMENT
// ===============================
const createPayment = async (req, res) => {
  try {
    const {
      user,
      booking,
      amount,
      method,
      transactionId,
    } = req.body;

    const payment = await Payment.create({
      user,
      booking,
      amount,
      method,
      transactionId,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL PAYMENTS
// ===============================
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user")
      .populate("booking");

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE PAYMENT STATUS
// ===============================
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      message: "Payment status updated",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment",
      error: error.message,
    });
  }
};

// ===============================
// DELETE PAYMENT
// ===============================
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  updatePaymentStatus,
  deletePayment,
};