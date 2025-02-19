const mongoose = require("mongoose");

const permissions = ["RESTRICTED", "UNRESTRICTED"];
const role_types = ["SYSTEM", "DEFAULT", "CUSTOM"];

const Role_Schema = new mongoose.Schema(
  {
    role: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: role_types,
      default: role_types[0],
    },
    active: { type: Boolean, required: true, default: false },
    permission: {
      type: String,
      enum: permissions,
      required: true,
      default: permissions[0],
    },
  },
  { timestamps: true }
);

const roles = mongoose.model("roles", Role_Schema);

module.exports = { roles, Role_Schema };
