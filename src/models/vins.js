const mongoose = require("mongoose");

const vin_types = ["VIN", "SUB_VIN", "HIN", "DIN", "SUB_DIN", "FIN", "MIN", "SID"];

const Vin_Schema = new mongoose.Schema(
  {
    type: { type: String, enum: vin_types, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "schools" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "students" },
    distributor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    vin: {
      type: String,
      required: true,
      //minlength: [16, "Vin must be at least 16 characters long"],
      unique: true,
    },
  },
  { timestamps: true }
);

const vins = mongoose.model("vins", Vin_Schema);

module.exports = { vins, Vin_Schema, vin_types };
