const mongoose = require("mongoose");

const ticket_status = ["pending", "in_progress", "completed"];

const Ticket_Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    complaint: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    resolution_status: {
      type: String,
      enum: ticket_status,
      required: true,
      default: ticket_status[0],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    complaintCategory: { type: String, required: true },
    treatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const tickets = mongoose.model("tickets", Ticket_Schema);

module.exports = {
  tickets,
  Ticket_Schema,
};
