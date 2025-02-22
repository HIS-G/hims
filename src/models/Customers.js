const mongoose = require("mongoose");

const Customer_Schema = new mongoose.Schema({
  firstname: { type: String, required: true },
  middlename: { type: String },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, unique: true },
  country: { type: String },
  state: { type: String },
  province: { type: String },
  zip_code: { type: String },
  address: { type: String },
  password: { type: String },
  device: [{ type: mongoose.Schema.Types.ObjectId, ref: "devices" }],
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
    required: true,
  },
  verified: { type: Boolean, default: false, required: true },
  activated: { type: Boolean, default: false, required: true },
});

const customers = mongoose.model("customers", Customer_Schema);

module.exports = { Customer_Schema, customers };
