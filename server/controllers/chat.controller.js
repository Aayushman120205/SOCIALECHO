const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const { emitToUser } = require("../sockets/connection");
const getSocketInstance = require("../sockets").getIO;

const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    if (recipientId === currentUserId) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getConversations = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const conversations = await Conversation.find({ participants: currentUserId })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate({
        path: "participants",
        select: "username fullname profilePicture",
      })
      .populate({
        path: "lastMessageId",
      });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversationId,
      senderId: currentUserId,
      content: content.trim(),
      messageType: "text",
      isRead: false,
    });

    conversation.lastMessageId = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "username fullname profilePicture"
    );

    const recipientId = conversation.participants.find(
      (participantId) => participantId.toString() !== currentUserId.toString()
    );

    const io = getSocketInstance();
    if (io && recipientId) {
      emitToUser(io, recipientId, "message:received", populatedMessage);
    }

    return res.status(200).json(populatedMessage);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
    const before = req.query.before;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const query = {
      conversationId,
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(limit);

    return res.status(200).json({
      messages,
      hasMore: messages.length === limit,
      before: before || null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createOrGetConversation,
  getConversations,
  sendMessage,
  getMessages,
};
