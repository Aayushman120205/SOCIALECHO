const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Stores the two users participating in the one-to-one conversation.
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (participants) =>
          Array.isArray(participants) && participants.length === 2 && new Set(participants.map(String)).size === 2,
        message: "Conversation must have exactly two unique participants",
      },
    },
    // Points to the most recent message in the conversation.
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Stores the timestamp of the most recent message for sorting.
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
