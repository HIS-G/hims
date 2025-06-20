const { messages } = require("../models/Messages");
const { directMessages } = require("../models/DirectMessages");
const { logger } = require("./logger");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_channel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    socket.on("send_message", async (messageData) => {
      try {
        const newMessage = new messages({
          channel: messageData.channelId,
          sender: {
            type: messageData.senderType,
            [messageData.senderType.toLowerCase()]:
              messageData.sender[messageData.senderType.toLowerCase()],
          },
          content: messageData.content,
          attachments: messageData.attachments || [],
          createdAt: messageData.createdAt,
        });

        const savedMessage = await newMessage.save();

        // Send back the complete message with user information
        io.to(messageData.channelId).emit("receive_message", {
          ...savedMessage.toObject(),
          sender: messageData.sender,
        });
      } catch (error) {
        logger.error("Message save error:", error);
        socket.emit("message_error", { error: error.message });
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.channelId).emit("user_typing", {
        userId: data.userId,
        channelId: data.channelId,
      });
    });

    socket.on("stop_typing", ({ channelId, userId }) => {
      socket.to(channelId).emit("stop_typing", { userId });
    });

    // Handle joining a direct message conversation
    socket.on("join_dm", async (conversationId) => {
      // todo: extract userId from token or session, find user in database and attach to socket
      // const userId = getUserIdFromToken(socket);
      // const userInfo = await db.getUserById(userId);
      // socket.userInfo = userInfo; // attach to socket object
      socket.join(`dm_${conversationId}`);
      console.log(`User ${socket.id} joined DM ${conversationId}`);
    });

    // Handle sending direct messages
    socket.on("send_direct_message", async (messageData) => {
      try {
        // Add logging to debug the incoming data

        let sender = { type: messageData.senderType.toUpperCase() };
        if (messageData.senderType === "USER") {
          sender.user = messageData.sender.user._id;
        } else if (messageData.senderType === "CUSTOMER") {
          sender.customer = messageData.sender.customer._id;
        }

        // Push message with structured sender

        const conversation = await directMessages
          .findOneAndUpdate(
            {
              _id: messageData.conversationId,
            },
            {
              $push: {
                messages: {
                  sender: sender,
                  content: messageData.content,
                  attachments: messageData.attachments || [],
                  createdAt: messageData.createdAt || new Date(),
                },
              },
              $set: { lastMessage: new Date() },
            },
            {
              new: true,
            }
          )
          .populate({
            path: `messages.sender.${messageData.senderType.toLowerCase()}`,
            select: "firstname lastname photo_url",
          });

        if (!conversation) {
          throw new Error("Conversation not found");
        }

        const newMessage =
          conversation.messages[conversation.messages.length - 1];

        // Format the message response
        const formattedMessage = {
          _id: newMessage._id,
          sender: {
            type: messageData.senderType,
            [messageData.senderType.toLowerCase()]:
              messageData.sender[messageData.senderType.toLowerCase()],
          },
          content: newMessage.content,
          attachments: newMessage.attachments,
          read: newMessage.read,
          createdAt: newMessage.createdAt,
        };

        // Emit the message with complete sender information
        io.to(`dm_${messageData.conversationId}`).emit(
          "receive_direct_message",
          {
            conversationId: messageData.conversationId,
            message: formattedMessage,
          }
        );
      } catch (error) {
        logger.error("Direct message error:", error);
        socket.emit("message_error", {
          error: error.message,
          conversationId: messageData.conversationId,
        });
      }
    });

    // Handle typing in direct messages
    socket.on("dm_typing", (data) => {
      console.log("typing data:", data);
      socket.to(`dm_${data.conversationId}`).emit("user_dm_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("dm_stop_typing", (data) => {
      socket.to(`dm_${data.conversationId}`).emit("user_dm_stop_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
