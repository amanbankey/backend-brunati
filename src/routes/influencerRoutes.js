const express = require("express");
const router = express.Router();
const Influencer = require("../models/Influencer");

/**
 * @desc    Get all active influencers
 * @route   GET /api/v1/influencers
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const influencers = await Influencer.find({ active: true }).sort({ priority: 1, createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Success",
            data: influencers
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
