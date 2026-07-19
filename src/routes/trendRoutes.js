const express = require("express");
const router = express.Router();
const Trend = require("../models/Trend");

/**
 * @desc    Get all active olfactory trends
 * @route   GET /api/v1/trends
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const trends = await Trend.find({ active: true })
            .populate("productId", "name images slug")
            .sort({ priority: 1, createdAt: -1 });

        res.status(200).json({
            status: true,
            message: "Success",
            data: trends
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
