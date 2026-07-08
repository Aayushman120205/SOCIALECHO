const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Links the message to a specific conversation.
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // Identifies the user who sent the message.
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Stores the message content for text-based chat.
    content: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (this.messageType === "text") {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: "Message content is required for text messages",
      },
      maxlength: [2000, "Message content cannot exceed 2000 characters"],
    },
    // Indicates the type of message, currently limited to text.
    messageType: {
      type: String,
      default: "text",
    },
    // Tracks whether the recipient has read the message.
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
