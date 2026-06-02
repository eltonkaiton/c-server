const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===================================
// CREATE EMPLOYEE
// ===================================
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, salary, password, position } = req.body;

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      phone,
      salary,
      password: hashedPassword,
      position: position || "Administrator",
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        salary: employee.salary,
        position: employee.position,
        createdAt: employee.createdAt,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// LOGIN (ONLY ADMIN ALLOWED)
// ===================================
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ONLY ADMINISTRATOR CAN LOGIN
    if (employee.position !== "Administrator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: employee._id, position: employee.position },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// GET ALL EMPLOYEES
// ===================================
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// GET SINGLE EMPLOYEE
// ===================================
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// UPDATE EMPLOYEE
// ===================================
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, phone, salary, position } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, salary, position },
      { new: true, runValidators: true }
    ).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// DELETE EMPLOYEE
// ===================================
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// GET ALL SUPERVISORS
// ===================================
exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await Employee.find({
      position: "Supervisor",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: supervisors.length,
      supervisors,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// UPDATE SUPERVISOR STATUS (adds status field if needed)
// ===================================
exports.updateSupervisorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const supervisor = await Employee.findById(req.params.id);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    if (supervisor.position !== "Supervisor") {
      return res.status(400).json({
        success: false,
        message: "User is not a supervisor",
      });
    }

    supervisor.status = status;
    await supervisor.save();

    res.status(200).json({
      success: true,
      message: "Supervisor status updated",
      supervisor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// GET ALL SUPPLIERS
// ===================================
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Employee.find({
      position: "Supplier",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// GET SINGLE SUPPLIER
// ===================================
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Employee.findById(req.params.id).select("-password");

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (supplier.position !== "Supplier") {
      return res.status(400).json({
        success: false,
        message: "User is not a supplier",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// UPDATE SUPPLIER STATUS (adds status field if needed)
// ===================================
exports.updateSupplierStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const supplier = await Employee.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (supplier.position !== "Supplier") {
      return res.status(400).json({
        success: false,
        message: "User is not a supplier",
      });
    }

    supplier.status = status;
    await supplier.save();

    res.status(200).json({
      success: true,
      message: "Supplier status updated",
      supplier,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};