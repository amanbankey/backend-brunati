const Product = require("../../models/Product");
const { deleteMultipleFromCloudinary } = require("../../utils/cloudinaryHelper");

const parseBody = (body) => {
    const parsed = { ...body };
    ['sizes', 'mainAccords', 'perfumePyramid', 'story'].forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                // Keep as is if not valid JSON
            }
        }
    });
    return parsed;
};

exports.createProduct = async (req, res) => {
    try {
        const productData = parseBody(req.body);

        // Handle uploaded images
        let images = [];
        if (req.files && req.files.images) {
            images = req.files.images.map(file => file.path);
        }
        productData.images = images;

        let storyImages = [];
        if (req.files && req.files.storyImages) {
            storyImages = req.files.storyImages.map(file => file.path);
        }
        if (!productData.story) productData.story = { sections: [] };
        productData.story.storyImages = storyImages;

        const product = new Product(productData);
        await product.save();
        res.status(201).json({ status: true, message: "Product created successfully", data: product });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productData = parseBody(req.body);

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ status: false, message: "Product not found", data: null });
        }

        // --- MERGE LOGIC FOR PRODUCT IMAGES ---
        const existingImages = productData.existingImages ? JSON.parse(productData.existingImages) : (product.images || []);
        let newImages = [];
        if (req.files && req.files.images) {
            newImages = req.files.images.map(file => file.path);
        }
        const updatedImages = [...existingImages, ...newImages];
        
        // Find images that were removed and delete them from Cloudinary
        const imagesToRemove = product.images.filter(img => !updatedImages.includes(img));
        if (imagesToRemove.length > 0) {
            await deleteMultipleFromCloudinary(imagesToRemove);
        }
        productData.images = updatedImages;

        // --- MERGE LOGIC FOR STORY IMAGES ---
        // productData.story is likely already parsed if it came as a single field
        const storyPayload = typeof productData.story === 'string' ? JSON.parse(productData.story) : productData.story;
        const existingStoryImages = storyPayload?.existingStoryImages || (product.story?.storyImages || []);
        
        let newStoryImages = [];
        if (req.files && req.files.storyImages) {
            newStoryImages = req.files.storyImages.map(file => file.path);
        }
        const updatedStoryImages = [...existingStoryImages, ...newStoryImages];

        // Find story images that were removed and delete them
        const storyImagesToRemove = (product.story?.storyImages || []).filter(img => !updatedStoryImages.includes(img));
        if (storyImagesToRemove.length > 0) {
            await deleteMultipleFromCloudinary(storyImagesToRemove);
        }
        
        productData.story = {
            sections: storyPayload?.sections || product.story?.sections || [],
            storyImages: updatedStoryImages
        };

        Object.assign(product, productData);
        await product.save();

        res.json({ status: true, message: "Product updated successfully", data: product });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ status: false, message: "Product not found", data: null });
        }

        // Delete all images (product images + story images) from Cloudinary
        const allImages = [...(product.images || [])];
        if (product.story && product.story.storyImages) {
            allImages.push(...product.story.storyImages);
        }

        if (allImages.length > 0) {
            await deleteMultipleFromCloudinary(allImages);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ status: true, message: "Product deleted successfully", data: null });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();
        const products = await Product.find().populate("category").sort({ createdAt: -1 }).skip(skip).limit(limit);


        res.json({ 
            status: true, 
            message: "Products fetched successfully", 
            data: products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};
