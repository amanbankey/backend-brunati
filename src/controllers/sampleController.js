const Product = require("../models/Product");
const Settings = require("../models/Settings");

exports.getAvailableSamples = async (req, res) => {
    try {
        // Always ensure a settings document exists with defaults (upsert)
        const settings = await Settings.findOneAndUpdate(
            {},
            { $setOnInsert: { freeSampleEnabled: true, maxSamples: 1 } },
            { upsert: true, new: true }
        );

        if (!settings.freeSampleEnabled) {
            return res.json({ status: true, message: "Free samples are currently disabled", data: { samples: [] } });
        }

        // Fetch all active products and present them as 1ml samples
        const products = await Product.find({ isActive: true });

        if (!products || products.length === 0) {
            return res.json({
                status: true,
                message: "No active products found to use as samples",
                data: { maxSamples: settings.maxSamples || 1, samples: [] }
            });
        }

        const samples = products.map(product => ({
            _id: product._id, // Use Product ID as Sample ID
            productId: product,
            size: "1 ml",
            active: true
        }));

        res.json({
            status: true,
            message: "Available samples fetched successfully",
            data: {
                maxSamples: settings.maxSamples || 1,
                samples
            }
        });
    } catch (error) {
        console.error("Error in getAvailableSamples:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};