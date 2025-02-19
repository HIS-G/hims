const router = require("express").Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.fetch_students);
router.post("/create_student", studentController.add_student);

module.exports = router;
