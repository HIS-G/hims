const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false } // avoid adding _id for each attachment
);

const MessageSchema = new mongoose.Schema(
  {
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
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DirectMessageSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: {
          type: String,
          enum: ["USER", "CUSTOMER"],
          required: true,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
      },
    ],
    messages: [MessageSchema],
    lastMessage: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const directMessages = mongoose.model("directMessages", DirectMessageSchema);

module.exports = { DirectMessageSchema, directMessages, AttachmentSchema };
