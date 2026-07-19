const express = require("express");
const router = express.Router();
const Banner = require("../models/Banner");

/**
 * @desc    Get all active banners
 * @route   GET /api/v1/banners
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const banners = await Banner.find({ active: true }).sort({ priority: 1, createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Success",
            data: banners
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
