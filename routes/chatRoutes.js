const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getMessagesByEmployeePosition,
  getMessagesByCustomerAndPosition,
  markMessagesAsReadByPosition,
  getEmployeeConversations,
  getCustomerConversations,
  markAsRead,
  getUnreadCount,
  getUnreadCountByPosition,
} = require("../controllers/chatController");

// Send a new message
router.post("/send", sendMessage);

// Get messages between user and employee
router.get("/history/:userId/:employeeId", getMessages);

// Get messages by employee position (for role-based chat)
router.get("/employee-messages", getMessagesByEmployeePosition);

// Get messages between customer and employee position
router.get("/messages/by-position", getMessagesByCustomerAndPosition);

// Mark messages as read by position
router.post("/mark-read-by-position", markMessagesAsReadByPosition);

// Get all conversations for an employee
router.get("/conversations/employee/:employeeId", getEmployeeConversations);

// Get all conversations for a customer
router.get("/conversations/customer/:customerId", getCustomerConversations);

// Mark messages as read
router.post("/mark-read", markAsRead);

// Get unread count for employee
router.get("/unread/:employeeId", getUnreadCount);

// Get unread count for employee by position
router.get("/unread-by-position/:employeePosition", getUnreadCountByPosition);

module.exports = router;