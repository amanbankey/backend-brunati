const Category = require("../models/Category");

exports.getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).select("name slug description image");
        res.json({ status: true, message: "Active categories fetched successfully", data: categories });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};
