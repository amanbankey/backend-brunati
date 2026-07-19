const Testimonial = require("../../models/Testimonial");

/**
 * @desc    Get all testimonials
 * @route   GET /api/v1/admin/testimonials
 * @access  Private/Admin
 */
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: true,
            message: "Testimonials fetched successfully",
            data: testimonials
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
 * @desc    Get testimonial by ID
 * @route   GET /api/v1/admin/testimonials/:id
 * @access  Private/Admin
 */
exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                status: false,
                message: "Testimonial not found",
                data: null
            });
        }
        res.status(200).json({
            status: true,
            message: "Testimonial found",
            data: testimonial
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
 * @desc    Create new testimonial
 * @route   POST /api/v1/admin/testimonials
 * @access  Private/Admin
 */
exports.createTestimonial = async (req, res) => {
    try {
        const { reviewerName, rating, reviewText, active } = req.body;
        
        const testimonial = await Testimonial.create({
            reviewerName,
            rating,
            reviewText,
            active
        });

        res.status(201).json({
            status: true,
            message: "Testimonial created successfully",
            data: testimonial
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
 * @desc    Update testimonial
 * @route   PUT /api/v1/admin/testimonials/:id
 * @access  Private/Admin
 */
exports.updateTestimonial = async (req, res) => {
    try {
        const { reviewerName, rating, reviewText, active } = req.body;
        
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                status: false,
                message: "Testimonial not found",
                data: null
            });
        }

        testimonial.reviewerName = reviewerName || testimonial.reviewerName;
        testimonial.rating = rating !== undefined ? rating : testimonial.rating;
        testimonial.reviewText = reviewText || testimonial.reviewText;
        testimonial.active = active !== undefined ? active : testimonial.active;

        const updatedTestimonial = await testimonial.save();

        res.status(200).json({
            status: true,
            message: "Testimonial updated successfully",
            data: updatedTestimonial
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
 * @desc    Delete testimonial
 * @route   DELETE /api/v1/admin/testimonials/:id
 * @access  Private/Admin
 */
exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                status: false,
                message: "Testimonial not found",
                data: null
            });
        }

        res.status(200).json({
            status: true,
            message: "Testimonial deleted successfully",
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
