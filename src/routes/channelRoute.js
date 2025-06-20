const router = require("express").Router();
const channelController = require("../controllers/channelController");

// todo: setup jwt and fetch user id from token where needed
router.post("/create", channelController.createChannel);
router.get("/list", channelController.listChannels);
router.post("/:id/join", channelController.joinChannel);
router.post("/approve", channelController.approveJoinRequest);
router.get("/:channelId/messages", channelController.getChannelMessages);
router.get("/:channelId", channelController.getChannelDetails);
router.get("/:channelId/join-requests", channelController.getJoinRequests);
router.post("/handle/join-requests", channelController.handleJoinRequest);
router.post("/:channelId/admin", channelController.assignUnasignAdmin);
router.patch("/:channelId", channelController.editChannel);
router.get("/:channelId/members", channelController.listChannelMembers);
router.get("/list/search", channelController.searchChannels);
router.get(
  "/user-channels/:userId",
  channelController.listChannelsWhereUserIsAMember
);
router.get(
  "/created-channels/:userId/:customerType",
  channelController.listUserCreatedChannels
);
router.get(
  "/open-channels/:userId",
  channelController.listChannelsWhereUserIsNotMember
);

router.get(
  "/admin/requests/:userId/:customerType",
  channelController.fetchChannelRequestsForAdmins
);
router.get(
  "/sent-requests/:userId/:customerType",
  channelController.fetchAllRequestSentByUser
);
router.get("/agora/token", channelController.generateAgoraToken);

module.exports = router;
