const router = require("express").Router();
const announcementController = require("../controllers/announcementController");

router.post("/create", announcementController.post_announcement);
router.get("", announcementController.list_announcements);
router.get("/featured", announcementController.get_featured_announcement);
router.get("/leader_board", announcementController.list_top_shares);
router.get("/:announcement_id", announcementController.get_announcement);
router.post("/delete", announcementController.delete_announcement);
router.post("/comment", announcementController.comment_on_announcement);
router.get("/:id/comments", announcementController.list_announcements_comments);
router.post(
  "/record_visit",
  announcementController.record_shared_announcement_visit
);
router.patch("/:id/update", announcementController.update_announcement);

module.exports = router;
