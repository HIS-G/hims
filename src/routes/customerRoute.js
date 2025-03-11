const router = require("express").Router();
const customerController = require("../controllers/customerController");

router.get("", customerController.get_customers);
router.get("/:customer_id/customer", customerController.get_single_customer);
router.get("/:customer_id/profile", customerController.my_profile);
router.post("/create_customer", customerController.create_customer);
router.put("/:id/update_customer", customerController.update_customer);
router.patch("/submit_sla", customerController.submit_sla);

module.exports = router;
