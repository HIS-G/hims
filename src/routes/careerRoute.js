const router = require("express").Router();
const careersController = require("../controllers/CareersController");

router.get("", careersController.read);
router.get("/:id", careersController.read_one);
router.post("/create", careersController.create);
router.post("/:id/apply", careersController.apply);
router.patch("/:id/update", careersController.update);
router.delete("/:id/delete", careersController.delete_career);

module.exports = router;