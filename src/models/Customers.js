const mongoose = require("mongoose");

const Customer_Schema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String },
  vin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
  sub_vin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
  fin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
  hin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
});

const customers = mongoose.model("customers", Customer_Schema);

module.exports = { Customer_Schema, customers };
