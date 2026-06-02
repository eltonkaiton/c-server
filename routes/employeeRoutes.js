const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,

  // SUPERVISOR FUNCTIONS
  getSupervisors,
  updateSupervisorStatus,

  // SUPPLIER FUNCTIONS
  getSuppliers,
  getSupplier,
  updateSupplierStatus,

} = require("../controllers/employeeController");

// ===================================
// AUTH ROUTE (EMPLOYEE LOGIN)
// ===================================
router.post("/login", loginEmployee);

// ===================================
// SUPERVISOR ROUTES
// ===================================
router.get("/supervisors/all", getSupervisors);
router.put("/supervisors/:id/status", updateSupervisorStatus);

// ===================================
// SUPPLIER ROUTES
// ===================================
router.get("/suppliers/all", getSuppliers);
router.get("/suppliers/:id", getSupplier);
router.put("/suppliers/:id/status", updateSupplierStatus);

// ===================================
// EMPLOYEE CRUD ROUTES
// ===================================
router.post("/", createEmployee);
router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;