const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");

router.post("/data/search", dashboardController.dashboard_data);
router.post("/growth-rate", dashboardController.getGrowthTrends);

module.exports = router;