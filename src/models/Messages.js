const mongoose = require("mongoose");
const { AttachmentSchema } = require("./DirectMessages");

const Message_Schema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels",
      required: true,
    },
    sender: {
      type: {
        type: String,
        enum: ["USER", "CUSTOMER"],
        required: true,
      },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    },
    content: {
      type: String,
      validate: {
        validator: function (value) {
          //  make 'content' required only if 'attachments' is empty or not present
          return !!value || (this.attachments && this.attachments.length > 0);
        },
        message: "Message must have either content or at least one attachment.",
      },
    },
    attachments: [AttachmentSchema],
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const messages = mongoose.model("messages", Message_Schema);

module.exports = { Message_Schema, messages };
