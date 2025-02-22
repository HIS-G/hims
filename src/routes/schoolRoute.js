const router = require("express").Router();
const schoolController = require("../controllers/schoolController");

router.get("/", schoolController.fetch_schools);
router.get("/:id", schoolController.get_school);
router.post("/create_school", schoolController.create_school);
router.put("/:id/update_school", schoolController.update_school);
router.patch("/:id/delist_school", schoolController.delist_school);

module.exports = router;
