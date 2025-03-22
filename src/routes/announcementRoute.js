const router = require("express").Router();
const announcementController = require("../controllers/announcementController");

router.post("/create", announcementController.post_announcement);
router.get("", announcementController.list_announcements);
router.get("/:announcement_id", announcementController.get_announcement);
router.post("/delete", announcementController.delete_announcement);
router.post("/comment", announcementController.comment_on_announcement);
router.get("/:id/comments", announcementController.list_announcements_comments);
router.post("/record_visit", announcementController.record_shared_announcement_visit);

module.exports = router;