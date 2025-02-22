const router = require("express").Router();
const roleController = require("../controllers/roleController");

router.get("", roleController.get_roles);
router.post("", roleController.create_role);

module.exports = router;
