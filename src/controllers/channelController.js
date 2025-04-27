const { channels } = require("../models/Channels");
const { messages } = require("../models/Messages");
const { logger } = require("../utils/logger");

const createChannel = async (req, res) => {
  const { name, description, type, creator } = req.body;

  try {
    const newChannel = new channels({
      name,
      description,
      type,
      creator,
      members: [
        {
          user: creator,
          role: "ADMIN",
        },
      ],
    });

    const savedChannel = await newChannel.save();

    return res.status(200).json({
      status: true,
      message: "Channel created successfully",
      channel: savedChannel,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const listChannels = async (req, res) => {
  try {
    const channelList = await channels
      .find({ active: true })
      .populate("creator", "firstname lastname")
      .select("-pendingRequests");

    return res.status(200).json({
      status: true,
      channels: channelList,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const joinChannel = async (req, res) => {
  const { userId, customerType } = req.body;
  const channelId = req.params.id;

  if (!userId || !customerType || !channelId) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters",
    });
  }

  try {
    const channel = await channels
      .findById(channelId)
      .populate("creator", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      // .populate("members.customer", "firstname lastname photo_url")
      .populate("pendingRequests.user", "firstname lastname photo_url")
      // .populate("pendingRequests.customer", "firstname lastname photo_url");

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    // Check if user is already a member
    const isMember = channel.members.some((member) => {
      if (customerType === "USER" && member.user) {
        return member.user._id.toString() === userId;
      }
      if (customerType === "CUSTOMER" && member.customer) {
        return member.customer._id.toString() === userId;
      }
      return false;
    });

    if (isMember) {
      return res.status(400).json({
        status: false,
        message: "You are already a member of this channel",
      });
    }

    // Check if user has pending request
    const hasPendingRequest = channel.pendingRequests.some((request) => {
      if (customerType === "USER" && request.user) {
        return request.user._id.toString() === userId;
      }
      if (customerType === "CUSTOMER" && request.customer) {
        return request.customer._id.toString() === userId;
      }
      return false;
    });

    if (hasPendingRequest) {
      return res.status(400).json({
        status: false,
        message: "You have already sent a join request to this channel",
      });
    }

    // const memberKey = customerType === "USER" ? "user" : "customer";

    if (channel.type === "PRIVATE") {
      channel.pendingRequests.push({
        ['user']: userId,
      });
    } else {
      channel.members.push({
        ['user']: userId,
        role: "MEMBER",
      });
    }

    await channel.save();

    return res.status(200).json({
      status: true,
      message:
        channel.type === "PRIVATE"
          ? "Join request sent successfully"
          : "Joined channel successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to process join request",
    });
  }
};

const approveJoinRequest = async (req, res) => {
  const { channelId, userId, customerType } = req.body;

  try {
    const channel = await channels.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    // const memberKey = customerType === "USER" ? "user" : "customer";

    channel.pendingRequests = channel.pendingRequests.filter(
      (request) => request['user'].toString() !== userId
    );

    channel.members.push({
      ['user']: userId,
      role: "MEMBER",
    });

    await channel.save();

    return res.status(200).json({
      status: true,
      message: "Join request approved successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getChannelMessages = async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const messagesList = await messages
      .find({ channel: channelId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender.user", "firstname lastname photo_url")
      .populate("sender.customer", "firstname lastname photo_url");

    const totalMessages = await messages.countDocuments({ channel: channelId });

    return res.status(200).json({
      status: true,
      messages: messagesList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getChannelDetails = async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await channels
      .findById(channelId)
      .populate("creator", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      // .populate("members.customer", "firstname lastname photo_url")
      .select("-pendingRequests");

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    return res.status(200).json({
      status: true,
      channel,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getJoinRequests = async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await channels
      .findById(channelId)
      .populate("pendingRequests.user", "firstname lastname photo_url")
      // .populate("pendingRequests.customer", "firstname lastname photo_url")
      .populate("creator", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      // .populate("members.customer", "firstname lastname photo_url");

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    const channelDetails = {
      name: channel.name,
      description: channel.description,
      type: channel.type,
      creator: channel.creator,
      members: channel.members,
      active: channel.active,
      _id: channel._id,
    };

    const pendingRequestsWithDetails = channel.pendingRequests.map(
      (request) => ({
        ...request.toObject(),
        channelDetails,
      })
    );
    return res.status(200).json({
      status: true,
      joinRequests: pendingRequestsWithDetails,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const handleJoinRequest = async (req, res) => {
  const { channelId, userId, customerType, requestId, action } = req.body;

  if (!channelId || !userId || !customerType || !action || !requestId) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters"
    });
  }

  if (!["ACCEPT", "REJECT"].includes(action.toUpperCase())) {
    return res.status(400).json({
      status: false,
      message: "Invalid action. Must be either ACCEPT or REJECT"
    });
  }

  try {
    const channel = await channels.findById(channelId);
    
    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found"
      });
    }

    // const memberKey = customerType === "USER" ? "user" : "customer";
    
    // Find the request using requestId
    const request = channel.pendingRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        status: false,
        message: "Join request not found"
      });
    }

   
   

    // Remove the request from pendingRequests using requestId
    channel.pendingRequests.pull(requestId);

    // If action is ACCEPT, add the user as a member
    if (action.toUpperCase() === "ACCEPT") {
      channel.members.push({
        ['user']: userId,
        role: "MEMBER"
      });
    }

    await channel.save();

    return res.status(200).json({
      status: true,
      message: action.toUpperCase() === "ACCEPT" ? 
        "Join request accepted successfully" : 
        "Join request rejected successfully"
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  createChannel,
  listChannels,
  joinChannel,
  approveJoinRequest,
  getChannelMessages,
  getChannelDetails,
  getJoinRequests,
  handleJoinRequest,
};
