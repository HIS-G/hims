const mongoose = require("mongoose");

const Career_Schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true},
    renumeration: { type: String },
    type: {type: String, required: true, default: "On-Site" },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    active: { type: Boolean, required: true, default: false },
    applications: { type: Number, required: true, default: 0}
}, {timestamps: true});

const careers = mongoose.model("careers", Career_Schema);

module.exports = { Career_Schema, careers };