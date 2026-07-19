const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true
    },

    active: {
        type: Boolean,
        default: true
    },

    priority: {
        type: Number,
        default: 1
    }

}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);