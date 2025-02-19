const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/admin/login", authController.admin_login);
router.post("/customer/login", authController.customer_login);
router.post(
  "/admin/:user_id/create_password",
  authController.create_admin_password
);
router.post("/admin/logout", authController.admin_logout);
router.post("/customer/logout", authController.customer_logout);

module.exports = router;
