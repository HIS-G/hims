const mongoose = require("mongoose");

const Message_Schema = new mongoose.Schema({
  channel: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'channels',
    required: true 
  },
  sender: {
    type: { 
      type: String, 
      enum: ['USER', 'CUSTOMER'],
      required: true 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' }
  },
  content: { type: String, required: true },
  attachments: [{
    url: String,
    type: String,
    name: String
  }],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    readAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const messages = mongoose.model("messages", Message_Schema);

module.exports = { Message_Schema, messages };