const mongoose = require("mongoose");

const Guarantor_Schema = new mongoose.Schema({});

const guarantors = mongoose.model("guarantors", Guarantor_Schema);

module.exports = { Guarantor_Schema, guarantors };
