const express = require("express");
const router = express.Router();
const {
  createOrGetConversation,
  getConversationHistory,
  listUserConversations,
  markMessagesAsRead,
  deleteConversation,
  searchCustomer,
  listUserConversationContactList,
} = require("../controllers/directMessageController");

// Create or get DM conversation
router.post("/conversations", createOrGetConversation);

// Get conversation history
router.get("/conversations/:conversationId", getConversationHistory);

// List user's conversations
router.get("/users/:userType/:userId/conversations", listUserConversations);

// List user's conversations contact list
router.get(
  "/users/:userType/:userId/conversations/contact-list",
  listUserConversationContactList
);

router.get("/users/search", searchCustomer);

// Mark messages as read
router.put("/conversations/:conversationId/read", markMessagesAsRead);

// Delete/Archive conversation
router.delete("/conversations/:conversationId", deleteConversation);

module.exports = router;
