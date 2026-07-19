const Category = require("../../models/Category");
const { deleteFromCloudinary } = require("../../utils/cloudinaryHelper");

exports.createCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        let image = "";

        if (req.file) {
            image = req.file.path;
        }

        const category = await Category.create({ name, description, image, isActive });
        res.status(201).json({ status: true, message: "Category created successfully", data: category });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found", data: null });
        }

        const { name, description, isActive } = req.body;
        
        if (req.file) {
            if (category.image) {
                await deleteFromCloudinary(category.image);
            }
            category.image = req.file.path;
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();
        res.json({ status: true, message: "Category updated successfully", data: category });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found", data: null });
        }

        if (category.image) {
            await deleteFromCloudinary(category.image);
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ status: true, message: "Category deleted successfully", data: null });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ status: true, message: "Categories fetched successfully", data: categories });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};
