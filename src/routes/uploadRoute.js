
const router = require("express").Router();
const uploadController = require("../controllers/uploadController");

router.post("/to-dm", uploadController.uploadToDM);
router.post("/to-channel", uploadController.uploadToChannel);

module.exports = router;