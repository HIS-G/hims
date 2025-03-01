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
    complaint_category: { type: String, required: true },
    custom_category: { type: String },
    treated_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const tickets = mongoose.model("tickets", TicketSchema);

module.exports = {
  tickets,
  Ticket_Schema,
};
