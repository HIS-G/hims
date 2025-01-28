const mongoose = require("mongoose");
const { owners } = require("./vins");

const User_Schema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: owners, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const users = mongoose.model("users", User_Schema);

module.exports = { User_Schema, users };
