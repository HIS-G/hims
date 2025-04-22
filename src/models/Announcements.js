const mongoose = require("mongoose");

const Comments_Schema = new mongoose.Schema({
  comment: { type: String, required: true, required: true },
  announcement: { type: mongoose.Schema.Types.ObjectId, ref: "announcements", required: true }, 
  parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: "comments" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
}, { timestamps: true });

const Announcement_Schema = new mongoose.Schema({
    title: { type: String, },
    instructions: { type: String },
    announcement: { type: String },
    reward: { type: Boolean, default: false },
    amount: { type: Number },
    rewardTypes: { type: [String] },
    twitterShare: { type: Boolean, default: false },
    linkedInShare: { type: Boolean, default: false },
    facebookShare: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

const Shared_Announcement_Schema = new mongoose.Schema({
  announcement: { type: mongoose.Schema.Types.ObjectId, ref: 'announcements', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers", },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", },
  vin: { type: String, required: true }, //{ type: mongoose.Schema.Types.ObjectId, ref: 'vins', required: true, },
  shareLink: { type: String, required: true },
  clickCount: { type: Number, required: true, default: 0 },
  leadConvertCount: { type: Number, required: true, default: 0 },
}, {timestamps: true});

const announcements = mongoose.model("announcements", Announcement_Schema);
const comments = mongoose.model("comments", Comments_Schema);
const sharedAnnouncements = mongoose.model("shared_announcements", Shared_Announcement_Schema);

module.exports = {
  announcements,
  comments,
  sharedAnnouncements,
  Comments_Schema,
  Announcement_Schema,
  Shared_Announcement_Schema
};
