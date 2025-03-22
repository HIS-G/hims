const router = require("express").Router();
const ticketController = require("../controllers/ticketController");

router.post("/create", ticketController.create_ticket);
router.post("/search", ticketController.search_tickets);

module.exports = router;