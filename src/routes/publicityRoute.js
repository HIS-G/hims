const router = require("express").Router();
const publicityController = require("../controllers/publicityController");

router.get("", publicityController.read);
router.get("/:id", publicityController.read_one);
router.get("/search", publicityController.search);
router.post("", publicityController.create);
router.patch("/:id", publicityController.update);
router.delete("/:id", publicityController.delete_data);

module.exports = router;
