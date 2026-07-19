const Review = require("../models/Review");

exports.getReviewsByProduct = async (req, res) => {

    const reviews = await Review.find({
        productId: req.params.productId
    });

    res.json({ status: true, message: "Reviews fetched successfully", data: reviews });

};

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, reviewText } = req.body;

        const alreadyReviewed = await Review.findOne({
            productId,
            userId: req.user._id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ status: false, message: "You have already reviewed this product", data: null });
        }

        const review = await Review.create({
            productId,
            userId: req.user._id,
            reviewerName: req.user.name,
            rating,
            reviewText
        });
        res.status(201).json({ status: true, message: "Review created successfully", data: review });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};