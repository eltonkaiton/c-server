const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ===============================
// CREATE USER
// ===============================
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      status: status || "Pending", // default fallback
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET ALL USERS
// ===============================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // hide password
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// UPDATE USER STATUS (IMPORTANT FOR YOUR BUTTONS)
// ===============================
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete users//
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};