const mongoose = require("mongoose");

const types = ["person", "company", "partners", "ads"];

const Publicize_Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String },
    contact: { type: String },
    address: { type: String },
    industry: { type: String },
    profession: { type: String },
    photo: { type: String },
    featured: { type: Boolean, default: false, required: true },
    type: { type: String, required: true, enum: types, default: types[0] },
  },
  { timestamps: true }
);

const publicity = mongoose.model("publicized", Publicize_Schema);

module.exports = {
  publicity,
  Publicize_Schema,
};
