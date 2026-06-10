const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUserName: {
      type: String,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    toUserName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ["customer", "employee"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: -1 });
conversationSchema.index({ customerId: 1, employeeId: 1 });
conversationSchema.index({ employeeId: 1, lastMessageTime: -1 });

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Message, Conversation };