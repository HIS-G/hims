const router = require("express").Router();
const { upload_file } = require("../utils/uploads");
const userController = require("../controllers/userController");

router.post("/create_user", userController.create_user);
router.post("/search", userController.search_users);
router.get("", userController.get_all_users);
router.post("/search_user", userController.get_single_user);
router.post("/:user_id/upload_profile", upload_file);
router.get("/:role/all", userController.get_users_by_role);
router.post("/:user_id/send_mail", userController.resend_verification_mail);

module.exports = router;
