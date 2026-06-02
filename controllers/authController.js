const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// REGISTER USER (CUSTOMERS ONLY)
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      status: "Pending",
    });

    res.status(201).json({
      message: "Registration successful. Await admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =========================
// LOGIN USER + EMPLOYEE
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // =========================
    // SEARCH USER FIRST
    // =========================
    let account = await User.findOne({ email });
    let isEmployee = false;

    // =========================
    // SEARCH EMPLOYEE IF NOT FOUND
    // =========================
    if (!account) {
      account = await Employee.findOne({ email });
      isEmployee = true;
    }

    if (!account) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================
    // PASSWORD CHECK
    // =========================
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // =========================
    // STATUS CHECK
    // =========================
    if (account.status && account.status !== "Active") {
      return res.status(403).json({
        message: `Account is ${account.status}. Please wait for approval.`,
      });
    }

    // =========================
    // ROLE + POSITION
    // =========================
    const role = isEmployee ? "employee" : "customer";
    const position = account.position || null;

    // =========================
    // JWT TOKEN
    // =========================
    const token = jwt.sign(
      {
        id: account._id,
        email: account.email,
        role,
        position,
      },
      process.env.JWT_SECRET || "SECRET_KEY_123",
      { expiresIn: "7d" }
    );

    // =========================
    // RESPONSE
    // =========================
    res.json({
      message: "Login successful",
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role,
        position,
        status: account.status || "Active",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};