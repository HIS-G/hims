const router = require("express").Router();
const announcementController = require("../controllers/announcementController");

router.get("", announcementController.list_announcements);

module.exports = router;