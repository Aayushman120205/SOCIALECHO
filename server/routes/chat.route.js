const router = require("express").Router();
const passport = require("passport");
const { body, param, validationResult } = require("express-validator");
const decodeToken = require("../middlewares/auth/decodeToken");
const {
  createOrGetConversation,
  getConversations,
  sendMessage,
  getMessages,
} = require("../controllers/chat.controller");

const requireAuth = passport.authenticate("jwt", { session: false }, null);

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => error.msg),
    });
  }

  next();
};

router.post(
  "/conversations",
  requireAuth,
  decodeToken,
  body("recipientId").notEmpty().withMessage("Recipient ID is required"),
  validateRequest,
  createOrGetConversation
);

router.get("/conversations", requireAuth, decodeToken, getConversations);

router.get(
  "/conversations/:conversationId/messages",
  requireAuth,
  decodeToken,
  param("conversationId").isMongoId().withMessage("Invalid conversation ID"),
  validateRequest,
  getMessages
);

router.post(
  "/conversations/:conversationId/messages",
  requireAuth,
  decodeToken,
  param("conversationId").isMongoId().withMessage("Invalid conversation ID"),
  body("content").trim().notEmpty().withMessage("Message content is required"),
  validateRequest,
  sendMessage
);

module.exports = router;
