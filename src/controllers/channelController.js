const { channels } = require("../models/Channels");
const { messages } = require("../models/Messages");
const { logger } = require("../utils/logger");
const mongoose = require("mongoose");

// const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const createChannel = async (req, res) => {
  const { name, description, type, creator, customerType, members } = req.body;

  try {
    // check if channel name already exists ignoring case
    const nameRegex = new RegExp(`^${name}$`, "i"); // case-insensitive regex

    const existingChannel = await channels.findOne({ name: nameRegex });

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
        type: customerType,
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

const listChannelsWhereUserIsAMember = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find channels where the user is a member (either as user or customer)
    const userChannels = await channels
      .find({
        $or: [{ "members.user": userId }, { "members.customer": userId }],
        active: true,
      })
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      .populate("members.customer", "firstname lastname photo_url"); // Removed select(-pendingRequests) to access pendingRequests

    // Add isAdmin field and joinRequestCount to each channel
    const channelsWithAdminStatus = userChannels.map((channel) => {
      const member = channel.members.find(
        (member) =>
          member.user?._id?.toString() === userId ||
          member.customer?._id?.toString() === userId
      );

      return {
        ...channel.toObject(),
        isAdmin: member?.role === "ADMIN",
        joinRequestCount: channel.pendingRequests?.length || 0,
        pendingRequests: undefined, // Remove pendingRequests from response
      };
    });

    return res.status(200).json({
      status: true,
      channels: channelsWithAdminStatus,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const listChannelsWhereUserIsNotMember = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find channels where the user is NOT a member (neither as user nor customer)
    const nonMemberChannels = await channels
      .find({
        $and: [
          {
            $nor: [{ "members.user": userId }, { "members.customer": userId }],
          },
          { active: true },
        ],
      })
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
      .select("-pendingRequests");

    return res.status(200).json({
      status: true,
      channels: nonMemberChannels,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const listUserCreatedChannels = async (req, res) => {
  const { userId, customerType } = req.params;

  if (!userId || !customerType) {
    return res.status(400).json({
      status: false,
      message: "User ID and customer type are required",
    });
  }

  try {
    const memberKey =
      customerType.toUpperCase() === "USER" ? "user" : "customer";

    const createdChannels = await channels
      .find({
        [`creator.${memberKey}`]: userId,
        active: true,
      })
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
      .populate("members.user", "firstname lastname photo_url")
      .populate("members.customer", "firstname lastname photo_url")
      .select("-pendingRequests");

    return res.status(200).json({
      status: true,
      channels: createdChannels,
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
        return res.status(200).json({
          status: true,
          message: "You are already a member of this channel",
        });
      }

      return res.status(200).json({
        status: true,
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
//todo: accept all pending request
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
    // Get channel details
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

    // Get all messages with attachments in this channel
    const channelMedia = await messages.aggregate([
      { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
      { $unwind: "$attachments" },
      {
        $group: {
          _id: "$attachments.type",
          files: {
            $push: {
              url: "$attachments.url",
              name: "$attachments.name",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    console.log(channelMedia, "media");

    // Organize media by type
    const mediaByType = {
      images: [],
      videos: [],
      audio: [],
      files: [],
    };

    channelMedia.forEach((media) => {
      // Handle MIME types
      if (media._id.startsWith("image/")) {
        mediaByType.images = media.files;
      } else if (media._id.startsWith("video/")) {
        mediaByType.videos = media.files;
      } else if (media._id.startsWith("audio/")) {
        mediaByType.audio = media.files;
      } else {
        // Any other MIME type goes to files array
        mediaByType.files = mediaByType.files.concat(media.files);
      }
    });

    return res.status(200).json({
      status: true,
      channel: channel,
      media: mediaByType,
    });
  } catch (error) {
    console.log("errorr");
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

//todo: accept all pending request
const handleJoinRequest = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid requests format or empty requests array",
    });
  }

  try {
    const results = {
      accepted: [],
      rejected: [],
      failed: [],
    };

    // Group requests by channelId for better performance
    const requestsByChannel = requests.reduce((acc, request) => {
      const { channelId } = request;
      if (!acc[channelId]) {
        acc[channelId] = [];
      }
      acc[channelId].push(request);
      return acc;
    }, {});

    // Process requests for each channel
    for (const [channelId, channelRequests] of Object.entries(
      requestsByChannel
    )) {
      const channel = await channels.findById(channelId);

      if (!channel) {
        channelRequests.forEach((request) => {
          results.failed.push({
            requestId: request.requestId,
            reason: "Channel not found",
          });
        });
        continue;
      }

      for (const request of channelRequests) {
        const { userId, customerType, requestId, action } = request; // Changed from requestingUserId to userId

        if (
          !userId ||
          !customerType ||
          !action ||
          !requestId ||
          !["ACCEPT", "REJECT"].includes(action.toUpperCase())
        ) {
          results.failed.push({
            requestId,
            reason: "Invalid request parameters",
          });
          continue;
        }

        const memberKey = customerType === "USER" ? "user" : "customer";
        const pendingRequest = channel.pendingRequests.id(requestId);

        if (!pendingRequest) {
          results.failed.push({ requestId, reason: "Join request not found" });
          continue;
        }

        // Remove the request from pendingRequests
        channel.pendingRequests.pull(requestId);

        // If action is ACCEPT, add the user as a member
        if (action.toUpperCase() === "ACCEPT") {
          channel.members.push({
            [memberKey]: userId,
            role: "MEMBER",
          });
          results.accepted.push(requestId);
        } else {
          results.rejected.push(requestId);
        }
      }

      await channel.save();
    }

    return res.status(200).json({
      status: true,
      message: "Join requests processed successfully",
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

const assignUnasignAdmin = async (req, res) => {
  const { channelId, userId, customerType, action } = req.body;

  if (!channelId || !userId || !customerType || !action) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters",
    });
  }

  if (!["ASSIGN", "UNASSIGN"].includes(action.toUpperCase())) {
    return res.status(400).json({
      status: false,
      message: "Invalid action. Must be either ASSIGN or UNASSIGN",
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

    // Find the member in the channel
    const memberIndex = channel.members.findIndex(
      (member) => member[memberKey]?.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        status: false,
        message: "User is not a member of this channel",
      });
    }

    // Check if trying to unassign the creator's admin role
    const isCreator = channel.creator[memberKey]?.toString() === userId;
    if (isCreator && action.toUpperCase() === "UNASSIGN") {
      return res.status(403).json({
        status: false,
        message: "Cannot remove admin role from channel creator",
      });
    }

    // Update the member's role
    channel.members[memberIndex].role =
      action.toUpperCase() === "ASSIGN" ? "ADMIN" : "MEMBER";

    await channel.save();

    return res.status(200).json({
      status: true,
      message: `Admin role ${action.toLowerCase()}ed successfully`,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
const searchChannels = async (req, res) => {
  const { query } = req.query;

  console.log("hello", query);
  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Search query is required",
    });
  }

  try {
    const channelsList = await channels
      .find({
        name: { $regex: query, $options: "i" },
        active: true,
      })
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
      .select("-pendingRequests");

    return res.status(200).json({
      status: true,
      channels: channelsList,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchChannelRequestsForAdmins = async (req, res) => {
  const { userId, customerType } = req.params;

  if (!userId || !customerType) {
    return res.status(400).json({
      status: false,
      message: "User ID and customer type are required",
    });
  }

  try {
    const memberKey =
      customerType.toUpperCase() === "USER" ? "user" : "customer";

    // Find channels where the user is an admin
    const adminChannels = await channels
      .find({
        members: {
          $elemMatch: {
            [`${memberKey}`]: userId,
            role: "ADMIN",
          },
        },
        "pendingRequests.0": { $exists: true }, // Only channels with pending requests
      })
      .populate("pendingRequests.user", "firstname lastname photo_url")
      .populate("pendingRequests.customer", "firstname lastname photo_url")
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url");

    const formattedRequests = adminChannels.map((channel) => ({
      channelId: channel._id,
      channelName: channel.name,
      channelType: channel.type,
      creator: channel.creator,
      pendingRequests: channel.pendingRequests,
    }));

    return res.status(200).json({
      status: true,
      requests: formattedRequests,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchAllRequestSentByUser = async (req, res) => {
  const { userId, customerType } = req.params;

  if (!userId || !customerType) {
    return res.status(400).json({
      status: false,
      message: "User ID and customer type are required",
    });
  }

  try {
    const memberKey =
      customerType.toUpperCase() === "USER" ? "user" : "customer";

    // Find channels where the user has pending requests
    const pendingChannels = await channels
      .find({
        [`pendingRequests.${memberKey}`]: userId,
        active: true,
      })
      .populate("creator.user", "firstname lastname photo_url")
      .populate("creator.customer", "firstname lastname photo_url")
      .select("name description type creator pendingRequests");

    // Format the response to include relevant channel details
    const formattedRequests = pendingChannels.map((channel) => ({
      channelId: channel._id,
      channelName: channel.name,
      channelDescription: channel.description,
      channelType: channel.type,
      channelImage: channel.image,
      creator: channel.creator,
      requestDetails: channel.pendingRequests.find(
        (request) => request[memberKey]?.toString() === userId
      ),
    }));

    return res.status(200).json({
      status: true,
      requests: formattedRequests,
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
  listChannelMembers,
  assignUnasignAdmin,
  searchChannels,
  listChannelsWhereUserIsAMember,
  listUserCreatedChannels,
  listChannelsWhereUserIsNotMember,
  fetchChannelRequestsForAdmins,
  fetchAllRequestSentByUser,
};
