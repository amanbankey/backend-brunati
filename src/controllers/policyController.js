const Policy = require("../models/Policy");

exports.getActivePolicies = async (req, res) => {
    try {
        const policies = await Policy.find({ isActive: true }).sort({ order: 1 });
        return res.status(200).json({
            status: true,
            message: "Active policies fetched successfully",
            data: policies
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};
