const mongoose = require("mongoose");

const Referral_Schema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    referral_link: { type: String, required: true },
    announcement: { type: String },
    announcement_link: { type: String },
    referral_count: { type: Number, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

const referrals = mongoose.model("referrals", Referral_Schema);

module.exports = {
  referrals,
  Referral_Schema,
};
