const User = require("../models/User");

// ======================
// GET ALL SUPERVISORS
// ======================
const getSupervisors = async (req, res) => {
  try {
    const users = await User.find({
      position: "Supervisor",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================
// CREATE SUPERVISOR
// ======================
const createSupervisor = async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const supervisor = await User.create({
      name,
      email,
      phone,
      password, // (IMPORTANT: you should hash this later)
      role: "employee",
      position: "Supervisor",
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Supervisor created",
      supervisor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================
// UPDATE SUPERVISOR STATUS
// ======================
const updateSupervisorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getSupervisors,
  createSupervisor,
  updateSupervisorStatus,
};