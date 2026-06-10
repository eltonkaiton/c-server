const { Message, Conversation } = require("../models/Chat");

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// =====================================
// SEND MESSAGE
// =====================================
const sendMessage = async (req, res) => {
  try {
    const { fromUserId, fromUserName, toUserId, toUserName, message, senderType } = req.body;

    if (!fromUserId || !toUserId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create new message
    const newMessage = new Message({
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      message,
      senderType,
      read: false,
    });

    await newMessage.save();

    // Update or create conversation
    let conversation = await Conversation.findOne({
      customerId: senderType === "customer" ? fromUserId : toUserId,
      employeeId: senderType === "customer" ? toUserId : fromUserId,
    });

    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastMessageTime = new Date();
      conversation.unreadCount += 1;
      await conversation.save();
    } else {
      conversation = new Conversation({
        customerId: senderType === "customer" ? fromUserId : toUserId,
        customerName: senderType === "customer" ? fromUserName : toUserName,
        employeeId: senderType === "customer" ? toUserId : fromUserId,
        employeeName: senderType === "customer" ? toUserName : fromUserName,
        lastMessage: message,
        lastMessageTime: new Date(),
        unreadCount: 1,
      });
      await conversation.save();
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      messageData: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET MESSAGES BETWEEN USER AND EMPLOYEE
// =====================================
const getMessages = async (req, res) => {
  try {
    const { userId, employeeId } = req.params;

    if (!userId || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId: employeeId },
        { fromUserId: employeeId, toUserId: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { toUserId: employeeId, fromUserId: userId, read: false },
      { read: true, readAt: new Date() }
    );

    // Reset unread count in conversation
    await Conversation.findOneAndUpdate(
      { customerId: userId, employeeId: employeeId },
      { unreadCount: 0 }
    );

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET MESSAGES BY EMPLOYEE POSITION (FIXED FOR ADMIN)
// =====================================
const getMessagesByEmployeePosition = async (req, res) => {
  try {
    const { employeeId, employeeName, employeePosition } = req.query;

    if (!employeePosition) {
      return res.status(400).json({
        success: false,
        message: "Employee position is required",
      });
    }

    // Build query based on whether employeeId is a valid ObjectId
    let query = {};
    
    // Check if employeeId is a valid MongoDB ObjectId and not "admin"
    if (employeeId && isValidObjectId(employeeId) && employeeId !== "admin") {
      query = {
        $or: [
          { toUserId: employeeId },
          { toUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') } }
        ]
      };
    } else {
      // For admin or invalid ID, only search by position name
      query = {
        toUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') }
      };
    }
    
    // Only get customer messages
    query.senderType = "customer";

    const messages = await Message.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
      count: messages.length,
      position: employeePosition,
    });
  } catch (error) {
    console.error("Error fetching messages by position:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET MESSAGES BETWEEN CUSTOMER AND EMPLOYEE POSITION
// =====================================
const getMessagesByCustomerAndPosition = async (req, res) => {
  try {
    const { customerId, employeePosition } = req.query;

    if (!customerId || !employeePosition) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and employee position are required",
      });
    }

    const messages = await Message.find({
      $or: [
        { 
          fromUserId: customerId, 
          toUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') } 
        },
        { 
          toUserId: customerId, 
          fromUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') } 
        }
      ]
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages by customer and position:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// MARK MESSAGES AS READ BY POSITION
// =====================================
const markMessagesAsReadByPosition = async (req, res) => {
  try {
    const { customerId, employeePosition } = req.body;

    if (!customerId || !employeePosition) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and employee position are required",
      });
    }

    const result = await Message.updateMany(
      { 
        fromUserId: customerId, 
        toUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') },
        read: false 
      },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET ALL CONVERSATIONS FOR AN EMPLOYEE
// =====================================
const getEmployeeConversations = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if employeeId is valid
    if (!isValidObjectId(employeeId)) {
      return res.json({
        success: true,
        conversations: [],
        unreadTotal: 0,
        count: 0,
      });
    }

    const conversations = await Conversation.find({ employeeId })
      .sort({ lastMessageTime: -1 });

    const unreadTotal = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    res.json({
      success: true,
      conversations,
      unreadTotal,
      count: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET ALL CONVERSATIONS FOR A CUSTOMER
// =====================================
const getCustomerConversations = async (req, res) => {
  try {
    const { customerId } = req.params;

    const conversations = await Conversation.find({ customerId })
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// MARK MESSAGES AS READ
// =====================================
const markAsRead = async (req, res) => {
  try {
    const { userId, employeeId } = req.body;

    await Message.updateMany(
      { fromUserId: employeeId, toUserId: userId, read: false },
      { read: true, readAt: new Date() }
    );

    await Conversation.findOneAndUpdate(
      { customerId: userId, employeeId: employeeId },
      { unreadCount: 0 }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET UNREAD COUNT FOR EMPLOYEE
// =====================================
const getUnreadCount = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if employeeId is valid
    if (!isValidObjectId(employeeId)) {
      return res.json({
        success: true,
        unreadCount: 0,
      });
    }

    const unreadCount = await Message.countDocuments({
      toUserId: employeeId,
      read: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET UNREAD COUNT FOR EMPLOYEE BY POSITION
// =====================================
const getUnreadCountByPosition = async (req, res) => {
  try {
    const { employeePosition } = req.params;

    if (!employeePosition) {
      return res.status(400).json({
        success: false,
        message: "Employee position is required",
      });
    }

    const unreadCount = await Message.countDocuments({
      toUserName: { $regex: new RegExp(`^${employeePosition}$`, 'i') },
      read: false,
      senderType: "customer"
    });

    res.json({
      success: true,
      unreadCount,
      position: employeePosition,
    });
  } catch (error) {
    console.error("Error getting unread count by position:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};