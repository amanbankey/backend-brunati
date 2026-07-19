const Banner = require("../models/Banner");
const Trend = require("../models/Trend");
const Testimonial = require("../models/Testimonial");
const Influencer = require("../models/Influencer");
const Announcement = require("../models/Announcement");

/**
 * @desc    Get all storefront content for landing page
 * @route   GET /api/v1/storefront
 * @access  Public
 */
exports.getStorefrontData = async (req, res) => {
    try {
        const [banners, trends, testimonials, influencers, announcements] = await Promise.all([
            Banner.find({ active: true }).sort({ priority: 1 }),
            Trend.find({ active: true }).populate("productId", "name category images slug").sort({ priority: 1 }),
            Testimonial.find({ active: true }).sort({ createdAt: -1 }).limit(10),
            Influencer.find({ active: true }).sort({ priority: 1 }),
            Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(1)
        ]);

        res.status(200).json({
            status: true,
            message: "Storefront data fetched successfully",
            data: {
                banners,
                trends,
                reviews: testimonials, // Map testimonials to reviews for frontend compatibility if needed, or update frontend to expect testimonials
                influencers,
                announcements: announcements[0] || null
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};
