const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },

    subtitle: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
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

module.exports = mongoose.model("Banner", bannerSchema);
