const router = require("express").Router();
const { upload_file } = require("../utils/uploads");
const customerController = require("../controllers/customerController");

router.get("", customerController.get_customers);
router.get("/:customer_id/update_status", customerController.update_user_status);
router.get("/:customer_id/customer", customerController.get_single_customer);
router.get("/:customer_id/profile", customerController.my_profile);
router.post("/create_customer", customerController.create_customer);
router.post("/:customer_id/upload_profile", upload_file);
router.put("/:id/update_customer", customerController.update_customer);
router.patch("/submit_sla", customerController.submit_sla);

module.exports = router;
