const router = require("express").Router();
const deviceController = require("../controllers/deviceController");

router.get("/", deviceController.fetch_devices);
router.get("/:id", deviceController.get_device);
router.get("/models/all", deviceController.fetch_device_models);
router.post("/create_model", deviceController.create_device_models);
router.post("/create_device", deviceController.create_device);
router.post("/search", deviceController.search_devices);
router.post("/upload", deviceController.upload_devices);
router.post("/delete", deviceController.delete_device);
router.patch("/:id/update_device", deviceController.update_device);
router.patch(
  "/:id/assign_distributor",
  deviceController.assign_distributor_to_product
);

module.exports = router;
