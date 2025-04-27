const mongoose = require("mongoose");

const Channel_Schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC',
    required: true 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true 
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    // customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    role: { 
      type: String, 
      enum: ['ADMIN', 'MEMBER'],
      default: 'MEMBER' 
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  pendingRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    // customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    requestedAt: { type: Date, default: Date.now }
  }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

const channels = mongoose.model("channels", Channel_Schema);

module.exports = { Channel_Schema, channels };