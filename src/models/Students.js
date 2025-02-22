const mongoose = require("mongoose");

const Student_Schema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    age: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    student_country: { type: String },
    student_state: { type: String },
    student_province: { type: String },
    student_address: { type: String, required: true },
    zip_code: { type: String },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "devices" },
    sch_vin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" },
    vin: { type: mongoose.Schema.Types.ObjectId, ref: "vins" },
    password: { type: String, required: true, minlength: 16 },
  },
  { timestamps: true }
);

const students = mongoose.model("students", Student_Schema);

module.exports = { Student_Schema, students };
