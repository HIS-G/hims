const router = require("express").Router();
const customerController = require("../controllers/customerController");

router.get("", customerController.get_customers);
router.get("/:customer_id", customerController.get_customer);
router.post("/create_customer", customerController.create_customer);
router.put("/:id/update_customer", customerController.update_customer);

module.exports = router;
