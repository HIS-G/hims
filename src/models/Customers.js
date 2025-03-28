const mongoose = require("mongoose");

const Customer_Schema = new mongoose.Schema({
  firstname: { type: String, required: true },
  middlename: { type: String },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  country: { type: String },
  state: { type: String },
  province: { type: String },
  zip_code: { type: String },
  address: { type: String },
  password: { type: String },
  device: [{ type: mongoose.Schema.Types.ObjectId, ref: "devices" }],
  verificationToken: { type: String },
  passwordResetToken: { type: String },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
    required: true,
  },
  referedBy: { type: mongoose.Schema.Types.ObjectId, ref: "vins" },
  referralLink: { type: String },
  announcement: { type: mongoose.Schema.Types.ObjectId, ref: "announcements" },
  verified: { type: Boolean, default: false, required: true },
  activated: { type: Boolean, default: false, required: true },
  test: { type: Boolean, required: true, default: false },
}, {timestamps: true});

const customers = mongoose.model("customers", Customer_Schema);

module.exports = { Customer_Schema, customers };
