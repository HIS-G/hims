const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/create_user", userController.create_user);

module.exports = router;
