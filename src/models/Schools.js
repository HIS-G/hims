const mongoose = require("mongoose");

const school_types = [
  "PRIMARY_SCHOOL",
  "SECONDARY_SCHOOL",
  "PRIMARY_&_SECONDARY_SCHOOL",
  "ELEMENTARY_SCHOOL",
  "HIGH_SCHOOL",
];

const School_Schema = new mongoose.Schema({
  school_name: { type: String, required: true },
  principal_name: { type: String, required: true },
  principal_email: { type: String, required: true },
  principal_phone: { type: String, required: true },
  school_email: { type: String, required: true },
  school_phone: { type: String, required: true },
  school_type: { type: String, enum: school_types, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  province: { type: String },
  zip_code: { type: String, required: true },
  address: { type: String, required: true },
  quiz_host: { type: Boolean, default: false, required: true },
  total_students: { type: Number },
  password: {
    type: String,
    minlength: [16, "Password cannot be less than 16 characters in length!"],
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
    required: true,
  },
  verificationToken: { type: String },
  vin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" },
});

const schools = mongoose.model("schools", School_Schema);

module.exports = { School_Schema, schools };
