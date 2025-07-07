const mongoose = require("mongoose");

const actions = [
  "LOGGED_IN",
  "LOGGED_OUT",
  "DELETED_ACCOUNT",
  "ACCOUNT_UPDATED",
  "TICKET_CREATED",
  "SHARED_ANNOUNCEMENT",
  "DOWNLOADED_QR_CODE",
  "FOLLOWED_SOCIAL_MEDIA_LINK",
  "INITIATED_PASSWORD_RESET",
  "PASSWORD_UPDATED",
  "PRODUCT_PURCHASED",
  "VERIFIED_ACCOUNT",
  "COMMENTED_ON_ANNOUNCEMENT",
];

const Activities_Schema = new mongoose.Schema(
  {
    action: { type: String, enum: actions, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const Activities = mongoose.model("activity-logs", Activities_Schema);

module.exports = {
  actions,
  Activities_Schema,
  Activities,
};
