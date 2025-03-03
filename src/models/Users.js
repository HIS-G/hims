const mongoose = require("mongoose");

const User_Schema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    country: { type: String },
    state: { type: String },
    province: { type: String },
    zip_code: { type: String },
    address: { type: String },
    verified: { type: Boolean, default: false, required: false },
    password: {
      type: String,
      minlength: [16, "Password cannot be less than 16 characters in length!"],
    },
    verificationToken: { type: String },
    approvedAt: { type: String },
    activated: { type: Boolean, default: false, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const users = mongoose.model("users", User_Schema);

module.exports = { User_Schema, users };
