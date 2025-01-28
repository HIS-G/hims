const mongoose = require("mongoose");

const owners = [
  "DISTRIBUTOR",
  "RETAILER",
  "CUSTOMER",
  "SCHOOL",
  "STUDENT",
  "TEACHER",
];

const vin_types = ["VIN", "HIN", "SCH_VIN", "DIN", "FIN"];

const Vin_Schema = new mongoose.Schema(
  {
    type: { type: String, enum: vin_types, required: true },
    owner: { type: String, enum: owners, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "schools" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    distributor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    vin: { type: String, required: true, minLength: 16, unique: true },
  },
  { timestamps: true }
);

const vins = mongoose.model("vins", Vin_Schema);

module.exports = { Vin_Schema, vins, vin_types, owners };
