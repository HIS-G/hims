const { messages } = require("../models/Messages");
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
        console.log(messageData, 'msg data') 
        const newMessage = new messages({ 
          channel: messageData.channelId, 
          sender: { 
            type: messageData.senderType, 
            [messageData.senderType.toLowerCase()]: messageData.sender[messageData.senderType.toLowerCase()],
          }, 
          content: messageData.content, 
          attachments: messageData.attachments || [], 
          createdAt: messageData.createdAt 
        }); 
    
        const savedMessage = await newMessage.save(); 
        
        // Send back the complete message with user information 
        io.to(messageData.channelId).emit("receive_message", { 
          ...savedMessage.toObject(), 
          sender: messageData.sender 
        }); 
        console.log("receive_message", savedMessage) 
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

    socket.on('stop_typing', ({ channelId, userId }) => {
      socket.to(channelId).emit('stop_typing', { userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};