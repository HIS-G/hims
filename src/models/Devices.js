const mongoose = require("mongoose");

const Device_Schema = new mongoose.Schema(
  {
    device_name: { type: String, required: true },
    model: { type: String, required: true },
    serial_no: { type: String, required: true, unique: true },
    build_no: { type: String, required: true, unique: true },
    imei: { type: String, required: true, unique: true },
    device_color: { type: String, required: true },
    din: { Type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    vin: { Type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    sch_vin: { Type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    fin: { Type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    hin: { Type: mongoose.Schema.Types.ObjectId, ref: "vin" },
  },
  { timestamps: true }
);

const devices = mongoose.model("devices", Device_Schema);

module.exports = { Device_Schema, devices };
