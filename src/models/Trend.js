const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Trend", trendSchema);
