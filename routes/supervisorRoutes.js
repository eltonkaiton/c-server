const express = require("express");
const router = express.Router();

const {
  getSupervisors,
  createSupervisor,
  updateSupervisorStatus,
} = require("../controllers/supervisorController");

// GET all supervisors
router.get("/supervisors", getSupervisors);

// CREATE supervisor
router.post("/supervisor", createSupervisor);

// UPDATE status
router.put("/:id/status", updateSupervisorStatus);

module.exports = router;