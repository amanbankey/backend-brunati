const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    reviewerName: String,

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    reviewText: String

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);