const mongoose = require("mongoose");

const Buyer_Schema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  province: { type: String },
  zip_code: { type: String },
  address: { type: String, required: true },
}, {timestamps: true});

const buyers = mongoose.model("buyers", Buyer_Schema);

module.exports = { buyers, Buyer_Schema };
