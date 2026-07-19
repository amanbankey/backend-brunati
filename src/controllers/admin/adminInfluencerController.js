const Influencer = require("../../models/Influencer");
const { deleteFromCloudinary } = require("../../utils/cloudinaryHelper");

/**
 * @desc    Get all influencers
 * @route   GET /api/v1/admin/influencers
 * @access  Private/Admin
 */
exports.getAllInfluencers = async (req, res) => {
    try {
        const influencers = await Influencer.find().sort({ priority: 1, createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Influencers fetched successfully",
            data: influencers
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
 * @desc    Create new influencer
 * @route   POST /api/v1/admin/influencers
 * @access  Private/Admin
 */
exports.createInfluencer = async (req, res) => {
    try {
        const { name, profession, wearing, priority } = req.body;
        
        if (!name || !profession) {
            return res.status(400).json({
                status: false,
                message: "Name and Profession are required",
                data: null
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Profile image is required",
                data: null
            });
        }

        const influencer = await Influencer.create({
            name,
            profession,
            wearing,
            imageUrl: req.file.path, // Cloudinary URL
            priority: Number(priority) || 0
        });

        res.status(201).json({
            status: true,
            message: "Influencer created successfully",
            data: influencer
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};


/**
 * @desc    Update influencer
 * @route   PUT /api/v1/admin/influencers/:id
 * @access  Private/Admin
 */
exports.updateInfluencer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, profession, wearing, priority, active } = req.body;
        const influencer = await Influencer.findById(id);

        if (!influencer) {
            return res.status(404).json({
                status: false,
                message: "Influencer not found",
                data: null
            });
        }

        if (req.file) {
            // Delete old image from Cloudinary
            if (influencer.imageUrl) {
                await deleteFromCloudinary(influencer.imageUrl);
            }
            influencer.imageUrl = req.file.path;
        }

        influencer.name = name || influencer.name;
        influencer.profession = profession || influencer.profession;
        influencer.wearing = wearing !== undefined ? wearing : influencer.wearing;
        influencer.priority = priority !== undefined ? Number(priority) : influencer.priority;
        influencer.active = active !== undefined ? active : influencer.active;

        const updatedInfluencer = await influencer.save();

        res.status(200).json({
            status: true,
            message: "Influencer updated successfully",
            data: updatedInfluencer
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};


/**
 * @desc    Delete influencer
 * @route   DELETE /api/v1/admin/influencers/:id
 * @access  Private/Admin
 */
exports.deleteInfluencer = async (req, res) => {
    try {
        const { id } = req.params;
        const influencer = await Influencer.findById(id);

        if (!influencer) {
            return res.status(404).json({
                status: false,
                message: "Influencer not found",
                data: null
            });
        }

        // Delete image from Cloudinary
        if (influencer.imageUrl) {
            await deleteFromCloudinary(influencer.imageUrl);
        }

        await Influencer.findByIdAndDelete(id);

        res.status(200).json({
            status: true,
            message: "Influencer deleted successfully",
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
