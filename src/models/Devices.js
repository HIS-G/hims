const mongoose = require("mongoose");

const model_types = [
  "MOBILE",
  "TABLET",
  "TV",
  "WHITEBOARD",
  "EARPODS",
  "HEADSETS",
];

const Device_Schema = new mongoose.Schema(
  {
    device_name: { type: String, required: true },
    device_model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "device-models",
      required: true,
    },
    serial_no: { type: String, required: true, unique: true },
    build_no: { type: String, required: true, unique: true },
    imei: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "buyers" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    /* distributor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, */
    din: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For distributors and wholesalers
    sub_din: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For retailers
    min: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For suppliers
    vin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For Schools
    sub_vin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For Students belonging to a school
    fin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For fans of HIS generated as soon as user registers as a fan of HIS
    hin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" }, // For just regular customers generated after SLA signed
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" }
  },
  { timestamps: true }
);

const Device_Model_Schema = new mongoose.Schema(
  {
    model_name: { type: String, required: true },
    colors: { type: [String], required: true },
    type: { type: String, required: true, enum: model_types },
  },
  { timestamps: true }
);

const devices = mongoose.model("devices", Device_Schema);
const deviceModels = mongoose.model("device-models", Device_Model_Schema);

module.exports = {
  Device_Schema,
  devices,
  deviceModels,
  Device_Model_Schema,
  model_types,
};

// Every individual associated with HIS must be a follower of all HIS social media pages and enable sharing of HIS Posts
