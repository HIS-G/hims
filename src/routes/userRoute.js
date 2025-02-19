const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/create_user", userController.create_user);
router.get("", userController.get_all_users);
router.get("/:role/all", userController.get_users_by_role);

module.exports = router;
