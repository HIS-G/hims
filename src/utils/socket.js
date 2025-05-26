const { messages } = require("../models/Messages");
// const { meetings } = require("../models/Meetings");
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
        console.log(messageData, "msg data");
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
        console.log("receive_message", savedMessage);
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

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    /* meeting
    socket.on("start meeting", async ({ channelId, hostUser }) => {
      console.log(`Meeting started by ${hostUser.id} in channel ${channelId}`);

      try {
        const newMeeting = new meetings({
          channelId: channelId,
          host: hostUser._id,
          isActive: true,
        });

        const savedMeeting = await newMeeting.save();
      } catch (error) {
        logger.error(error);
        console.log(error);
      }
    });

    // Notify all channel members (except sender)
    socket.to(channelId).emit("meeting_started", {
      channelId,
      hostUser,
      meetingId: `meeting-${channelId}`, // Generate meeting ID (can be UUID/db ID)
    });

    // User joins the meeting — establish peer connection
    socket.on("join_meeting", ({ meetingId, userId }) => {
      socket.join(meetingId);
      console.log(`${userId} joined meeting room: ${meetingId}`);

      socket.to(meetingId).emit("user_joined_meeting", { userId });
    });

    // WebRTC Signaling: Offer
    socket.on("offer", ({ meetingId, offer, from }) => {
      socket.to(meetingId).emit("offer", { offer, from });
    });

    // WebRTC Signaling: Answer
    socket.on("answer", ({ meetingId, answer, from }) => {
      socket.to(meetingId).emit("answer", { answer, from });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on("ice_candidate", ({ meetingId, candidate, from }) => {
      socket.to(meetingId).emit("ice_candidate", { candidate, from });
    });

    // Optional: end meeting
    socket.on("end_meeting", ({ meetingId }) => {
      io.to(meetingId).emit("meeting_ended", { meetingId });
      // Optionally leave room
      socket.leave(meetingId);
    }); */
  });
};
