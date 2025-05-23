const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema(
  {
    channelId: { type: String },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "customers",
    },
    isActive: { type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

const MeetingParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mettings",
      required: true,
    },
    joinedAt: { type: String },
  },
  { timestamps: true }
);

const meetings = mongoose.model("meetings", MeetingSchema);
const participants = mongoose.model("participants", MeetingParticipantSchema);

module.exports = {
  meetings,
  participants,
};
