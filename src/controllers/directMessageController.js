const { directMessages } = require("../models/DirectMessages");
const { users } = require("../models/Users");
const { customers } = require("../models/Customers");
const { vins } = require("../models/vins");
const { logger } = require("../utils/logger");

// Create or get a direct message conversation
const createOrGetConversation = async (req, res) => {
  const { participants } = req.body;

  // Validate participants input
  if (!participants || !Array.isArray(participants)) {
    return res.status(400).json({
      status: false,
      message: "Participants must be an array",
    });
  }

  if (participants.length !== 2) {
    return res.status(400).json({
      status: false,
      message: "Exactly two participants are required",
    });
  }

  // Validate participant structure
  for (const participant of participants) {
    if (!participant.type || !participant[participant.type.toLowerCase()]) {
      return res.status(400).json({
        status: false,
        message: `Invalid participant structure. Each participant must have 'type' and corresponding ID field`,
        expected: {
          type: "Customer or User",
          [participant.type?.toLowerCase() || "example"]: "participantId",
        },
      });
    }
  }

  try {
    const searchCriteria = {
      participants: {
        $all: participants.map((p) => ({
          $elemMatch: {
            type: p.type,
            [p.type.toLowerCase()]: p[p.type.toLowerCase()],
          },
        })),
      },
    };
    logger.info("Search criteria:", JSON.stringify(searchCriteria));

    // Find existing conversation between participants
    let conversation = await directMessages
      .findOne(searchCriteria)
      .populate("participants.user", "firstname lastname photo_url")
      .populate("participants.customer", "firstname lastname photo_url");

    if (!conversation) {
      // Create new conversation if none exists
      conversation = new directMessages({
        participants,
        messages: [],
      });
      await conversation.save();

      // Populate the newly created conversation
      conversation = await directMessages
        .findById(conversation._id)
        .populate("participants.user", "firstname lastname photo_url")
        .populate("participants.customer", "firstname lastname photo_url");
    }

    return res.status(200).json({
      status: true,
      conversation,
    });
  } catch (error) {
    logger.error("Create conversation error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    // First get the conversation with populated messages
    const conversation = await directMessages
      .findById(conversationId)
      .populate({
        path: "messages.sender.user",
        select: "firstname lastname photo_url",
      })
      .populate({
        path: "messages.sender.customer",
        select: "firstname lastname photo_url",
      })
      .slice("messages", [(page - 1) * limit, limit])
      .sort({ "messages.createdAt": -1 });

    if (!conversation) {
      return res.status(404).json({
        status: false,
        message: "Conversation not found",
      });
    }

    // Process messages to include correct sender data
    const processedMessages = conversation.messages.map((message) => {
      const senderType = message.sender.type.toLowerCase();
      const senderData = message.sender[senderType];

      return {
        _id: message._id,
        sender: {
          type: message.sender.type,
          [senderType]: senderData
            ? {
                _id: senderData._id,
                firstname: senderData.firstname,
                lastname: senderData.lastname,
                photo_url: senderData.photo_url,
              }
            : null,
        },
        content: message.content,
        attachments: message.attachments || [],
        read: message.read,
        createdAt: message.createdAt,
      };
    });

    const totalMessages = await directMessages
      .findById(conversationId)
      .select("messages")
      .then((doc) => doc.messages.length);

    return res.status(200).json({
      status: true,
      messages: processedMessages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
    });
  } catch (error) {
    logger.error("Get conversation history error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// List all conversations for a user
const listUserConversations = async (req, res) => {
  const { userId, userType } = req.params;

  try {
    const conversations = await directMessages
      .find({
        participants: {
          $elemMatch: {
            type: userType,
            [userType.toLowerCase()]: userId,
          },
        },
        active: true,
      })
      .populate("participants.user", "firstname lastname photo_url")
      .populate("participants.customer", "firstname lastname photo_url")
      .sort({ lastMessage: -1 });

    return res.status(200).json({
      status: true,
      conversations,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const listUserConversationContactList = async (req, res) => {
  const { userId, userType } = req.params;

  try {
    const conversations = await directMessages
      .find({
        participants: {
          $elemMatch: {
            type: userType,
            [userType.toLowerCase()]: userId,
          },
        },
        active: true,
      })
      .populate("participants.user", "firstname lastname photo_url email")
      .populate("participants.customer", "firstname lastname photo_url email")
      .sort({ lastMessage: -1 });

    const contacts = conversations.reduce((acc, conversation) => {
      // Get all participants that are not the current user
      conversation.participants.forEach((participant) => {
        const participantData = participant.user || participant.customer;

        // Skip if this is the current user
        if (
          participantData?._id?.toString() === userId &&
          participant.type === userType
        ) {
          return;
        }

        // Check if this contact is already in our list
        if (
          participantData &&
          !acc.some(
            (c) => c._id?.toString() === participantData._id?.toString()
          )
        ) {
          acc.push({
            _id: participantData._id,
            type: participant.type,
            firstname: participantData.firstname,
            lastname: participantData.lastname,
            photo_url: participantData.photo_url,
            email: participantData.email,
            conversationId: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageTime: conversation.updatedAt,
          });
        }
      });
      return acc;
    }, []);

    // Sort contacts by last message or creation time
    const sortedContacts = contacts.sort((a, b) => {
      const timeA = a.lastMessage || a.lastMessageTime;
      const timeB = b.lastMessage || b.lastMessageTime;
      if (!timeA || !timeB) return 0;
      return new Date(timeB) - new Date(timeA);
    });

    return res.status(200).json({
      status: true,
      contacts: sortedContacts,
    });
  } catch (error) {
    logger.error("List conversation contacts error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const { messageIds } = req.body;

  try {
    const result = await directMessages.updateOne(
      { _id: conversationId },
      {
        $set: {
          "messages.$[elem].read": true,
        },
      },
      {
        arrayFilters: [{ "elem._id": { $in: messageIds } }],
        multi: true,
      }
    );

    return res.status(200).json({
      status: true,
      message: "Messages marked as read",
      updated: result.nModified,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete/Archive conversation
const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    await directMessages.findByIdAndUpdate(conversationId, {
      active: false,
    });

    return res.status(200).json({
      status: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/// serac customer/user to dm
const searchCustomer = async (req, res) => {
  const { query, userType } = req.query;

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Query is required",
    });
  }

  try {
    const searchCriteria = {
      $or: [
        { firstname: new RegExp(query, "i") },
        { lastname: new RegExp(query, "i") },
        { username: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ],
    };

    let results;

    results = await customers
      .find(searchCriteria)
      .select("_id firstname lastname photo_url email");

    return res.status(200).json({
      status: true,
      results,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrGetConversation,
  getConversationHistory,
  listUserConversations,
  listUserConversationContactList,
  markMessagesAsRead,
  deleteConversation,
  searchCustomer,
};
