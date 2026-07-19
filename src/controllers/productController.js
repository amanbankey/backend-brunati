const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
    const { category, search, accord, note } = req.query;

    let filter = {};

    if (category && category !== "all") {
        filter.category = category;
    }

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    if (accord) {
        filter.mainAccords = { $in: [accord] };
    }

    if (note) {
        filter.$or = [
            { "perfumePyramid.top": { $in: [note] } },
            { "perfumePyramid.middle": { $in: [note] } },
            { "perfumePyramid.base": { $in: [note] } },
        ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate("category").skip(skip).limit(limit);

    res.json({ 
        status: true, 
        message: "Products fetched successfully", 
        data: products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
};

exports.getProductBySlug = async (req, res) => {
    
    let product;
    const mongoose = require('mongoose');
    if (mongoose.isValidObjectId(req.params.slug)) {
        product = await Product.findById(req.params.slug).populate("category");
    }
    if (!product) {
        product = await Product.findOne({ slug: req.params.slug }).populate("category");
    }

    if (!product) {
        return res.status(404).json({ status: false, message: "Product not found", data: null });
    }

    res.json({ status: true, message: "Product fetched successfully", data: product });

};



