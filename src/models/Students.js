const mongoose = require("mongoose");

const Student_Schema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'devices' },
    sch_vin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    vin: { type: mongoose.Schema.Types.ObjectId, ref: "vin" },
    password: { type: String, required: true, minLength: 16 },
  },
  { timestamps: true }
);

const students = mongoose.model("students", Student_Schema);

module.exports = { Student_Schema, students };
