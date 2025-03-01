const mongoose = require("mongoose");

const Announcement_Schema = new mongoose.Schema({
    title: { type: String, },
    announcement: { },
}, { timestamps: true });

const announcements = mongoose.model("", Announcement_Schema);

module.exports = {
  announcements,
  Announcement_Schema,
};
