const router = require("express").Router();
const channelController = require("../controllers/channelController");

router.post("/create", channelController.createChannel);
router.get("/list", channelController.listChannels);
router.post("/:id/join", channelController.joinChannel);
router.post("/approve", channelController.approveJoinRequest);
router.get("/:channelId/messages", channelController.getChannelMessages);
router.get("/:channelId", channelController.getChannelDetails);
router.get("/:channelId/join-requests", channelController.getJoinRequests);
router.post(
  "/join-requests/:requestId/accept/reject",
  channelController.handleJoinRequest
);
router.patch("/:channelId", channelController.editChannel);
router.get("/:channelId/members", channelController.listChannelMembers);
router.get("/agora/token", channelController.generateAgoraToken)

module.exports = router;
