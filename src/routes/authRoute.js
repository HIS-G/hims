const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/admin/login", authController.admin_login);
router.post("/customers/login", authController.customer_login);
router.post(
  "/admin/:user_id/create_password",
  authController.create_admin_password
);
router.post(
  "/customer/:customer_id/reset_password",
  authController.create_customer_password
);
router.post(
  "/school/:school_id/create_password",
  authController.create_school_password
);
router.post("/customer/verify-account", authController.verify_account);
router.post("/admin/logout", authController.admin_logout);
router.post("/customer/logout", authController.customer_logout);
router.post("/reset-password", authController.send_password_reset_link);

module.exports = router;
