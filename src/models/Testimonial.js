const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
    reviewerName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Testimonial", testimonialSchema);
