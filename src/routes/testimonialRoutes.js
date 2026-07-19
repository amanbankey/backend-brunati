const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");

/**
 * @desc    Get all active testimonials
 * @route   GET /api/v1/testimonials
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Success",
            data: testimonials
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
});

module.exports = router;
