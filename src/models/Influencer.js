const mongoose = require("mongoose");

const influencerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    wearing: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Influencer", influencerSchema);
