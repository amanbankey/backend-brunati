const Trend = require("../../models/Trend");
const { deleteFromCloudinary } = require("../../utils/cloudinaryHelper");

/**
 * @desc    Get all trends
 * @route   GET /api/v1/admin/trends
 * @access  Private/Admin
 */
exports.getAllTrends = async (req, res) => {
    try {
        const trends = await Trend.find().populate("productId", "name category images").sort({ priority: 1, createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Trends fetched successfully",
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * @desc    Create new trend
 * @route   POST /api/v1/admin/trends
 * @access  Private/Admin
 */
exports.createTrend = async (req, res) => {
    try {
        const { productId, priority } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Video file is required",
                data: null
            });
        }

        const trend = await Trend.create({
            productId,
            videoUrl: req.file.path, // Cloudinary URL
            priority: priority || 0
        });

        res.status(201).json({
            status: true,
            message: "Trend created successfully",
            data: trend
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * @desc    Update trend
 * @route   PUT /api/v1/admin/trends/:id
 * @access  Private/Admin
 */
exports.updateTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, priority, active } = req.body;
        const trend = await Trend.findById(id);

        if (!trend) {
            return res.status(404).json({
                status: false,
                message: "Trend not found",
                data: null
            });
        }

        if (req.file) {
            // Delete old video from Cloudinary
            if (trend.videoUrl) {
                await deleteFromCloudinary(trend.videoUrl);
            }
            trend.videoUrl = req.file.path;
        }

        trend.productId = productId || trend.productId;
        trend.priority = priority !== undefined ? priority : trend.priority;
        trend.active = active !== undefined ? active : trend.active;

        const updatedTrend = await trend.save();

        res.status(200).json({
            status: true,
            message: "Trend updated successfully",
            data: updatedTrend
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * @desc    Delete trend
 * @route   DELETE /api/v1/admin/trends/:id
 * @access  Private/Admin
 */
exports.deleteTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const trend = await Trend.findById(id);

        if (!trend) {
            return res.status(404).json({
                status: false,
                message: "Trend not found",
                data: null
            });
        }

        // Delete video from Cloudinary
        if (trend.videoUrl) {
            await deleteFromCloudinary(trend.videoUrl);
        }

        await Trend.findByIdAndDelete(id);

        res.status(200).json({
            status: true,
            message: "Trend deleted successfully",
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};
