const router = require("express").Router();
const activitiesController = require("../controllers/activityLogs");
const authorize = require("../middlewares/authorizer");

router.post("", authorize, activitiesController.log_activity);
router.get("", authorize, activitiesController.my_activities);
router.post("/search", authorize, activitiesController.search_activities);

module.exports = router;
