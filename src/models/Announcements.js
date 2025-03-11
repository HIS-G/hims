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
    announcement: { type: String },
}, { timestamps: true });

const announcements = mongoose.model("announcements", Announcement_Schema);
const comments = mongoose.model("comments", Comments_Schema);

module.exports = {
  announcements,
  comments,
  Comments_Schema,
  Announcement_Schema,
};
