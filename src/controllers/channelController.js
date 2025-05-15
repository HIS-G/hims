const { channels } = require("../models/Channels");
const { messages } = require("../models/Messages");
const { logger } = require("../utils/logger");

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const createChannel = async (req, res) => {
  const { name, description, type, creator, customerType } = req.body;

  try {
    // check if channel name already exists
    const existingChannel = await channels.findOne({ name });

    if (existingChannel) {
      return res.status(409).json({
        status: false,
        message: "Channel name already exists",
      });
    }
    const memberKey = customerType === "USER" ? "user" : "customer";
    const newChannel = new channels({
      name,
      description,
      type,
      creator: {
        [memberKey]: creator,
      },
      members: [
        {
          [memberKey]: creator,
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
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
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

const listChannelMembers = async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await channels
     .findById(channelId)
     .populate("members.user", "firstname lastname photo_url")
     .populate("members.customer", "firstname lastname photo_url")
     .select("-pendingRequests");

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }
    return res.status(200).json({
      status: true,
      members: channel.members,
    })

  } catch (error){
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
  

}

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
    const memberKey = customerType === "USER" ? "user" : "customer";

    // Use findOne with both membership and pending request checks in a single query
    const channel = await channels
      .findOne({
        _id: channelId,
        $nor: [
          { [`members.${memberKey}`]: userId },
          { [`pendingRequests.${memberKey}`]: userId },
        ],
      })
      .populate("creator", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      .populate("members.customer", "firstname lastname photo_url")
      .populate("pendingRequests.user", "firstname lastname photo_url")
      .populate("pendingRequests.customer", "firstname lastname photo_url");

    if (!channel) {
      // Check if channel exists at all
      const channelExists = await channels.findById(channelId);
      if (!channelExists) {
        return res.status(404).json({
          status: false,
          message: "Channel not found",
        });
      }

      // If channel exists but we couldn't get it with our query, user is already a member or has pending request
      const existingMember = await channels.findOne({
        _id: channelId,
        [`members.${memberKey}`]: userId,
      });

      if (existingMember) {
        return res.status(409).json({
          status: false,
          message: "You are already a member of this channel",
        });
      }

      return res.status(409).json({
        status: false,
        message: "You have already sent a join request to this channel",
      });
    }

    // Use atomic update operation to prevent race conditions
    const update =
      channel.type === "PRIVATE"
        ? { $push: { pendingRequests: { [memberKey]: userId } } }
        : { $push: { members: { [memberKey]: userId, role: "MEMBER" } } };

    await channels.findByIdAndUpdate(channelId, update, { new: true });

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

const deleteChannel = async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await channels.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    // delte channle

    // remove channel

    return res.status(200).json({
      status: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const editChannel = async (req, res) => {
  const { channelId } = req.params;
  // todo: can a channel be changed to public / private later?
  const { name, description } = req.body;

  try {
    const channel = await channels.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    if (name) {
      channel.name = name;
    }

    if (description) {
      channel.description = description;
    }

    await channel.save();

    return res.status(200).json({
      status: true,
      message: "Channel updated successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
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

    const memberKey = customerType === "USER" ? "user" : "customer";

    channel.pendingRequests = channel.pendingRequests.filter(
      (request) => request["user"].toString() !== userId
    );

    channel.members.push({
      [memberKey]: userId,
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
  // todo: need to know the user id to determine if he/she is a member of the channel
  const { channelId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const messagesList = await messages
      .find({ channel: channelId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "sender.user",
        select: "firstname lastname photo_url",
      })
      .populate({
        path: "sender.customer",
        select: "firstname lastname photo_url",
      });

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
      .populate("members.customer", "firstname lastname photo_url")
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
      .populate("pendingRequests.customer", "firstname lastname photo_url")
      .populate("creator", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      .populate("members.customer", "firstname lastname photo_url");

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
      message: "Missing required parameters",
    });
  }

  if (!["ACCEPT", "REJECT"].includes(action.toUpperCase())) {
    return res.status(400).json({
      status: false,
      message: "Invalid action. Must be either ACCEPT or REJECT",
    });
  }

  try {
    const channel = await channels.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        status: false,
        message: "Channel not found",
      });
    }

    const memberKey = customerType === "USER" ? "user" : "customer";

    // Find the request using requestId
    const request = channel.pendingRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        status: false,
        message: "Join request not found",
      });
    }

    // Remove the request from pendingRequests using requestId
    channel.pendingRequests.pull(requestId);

    // If action is ACCEPT, add the user as a member
    if (action.toUpperCase() === "ACCEPT") {
      channel.members.push({
        [memberKey]: userId,
        role: "MEMBER",
      });
    }

    await channel.save();

    return res.status(200).json({
      status: true,
      message:
        action.toUpperCase() === "ACCEPT"
          ? "Join request accepted successfully"
          : "Join request rejected successfully",
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

generateAgoraToken = async (req, res) => {
  const appID = "9e80c403635040c986d6105abcb8142c";
  const appCertificate = "3d611ad1d8064977839193c16589031f";
  const channelName = req.query.channelName;
  const uid = 0; //  for dynamic assignment
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.json({ token });
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
  editChannel,
  generateAgoraToken,
  listChannelMembers
};
