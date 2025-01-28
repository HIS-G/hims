const mongoose = require("mongoose");

const School_Schema = new mongoose.Schema({
    name: { type: String, required: true },
    principal_name: {},
    principal_email: {},
    principal_phone: {},
    school_email: {},
    school_phone: {},
    school_type: {},
    address: {},
    
});

const Schools = mongoose.model("schools", School_Schema);

module.exports = { School_Schema, Schools };
