const Policy = require("../../models/Policy");

// Get all policies (active & inactive)
exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find({}).sort({ order: 1 });
        return res.status(200).json({
            status: true,
            message: "All policies fetched successfully",
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

// Create a new policy
exports.createPolicy = async (req, res) => {
    try {
        const { title, content, order, isActive } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                status: false,
                message: "Title and Content are required",
                data: null
            });
        }

        const policy = new Policy({
            title,
            content,
            order: order !== undefined ? Number(order) : 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        await policy.save();

        return res.status(201).json({
            status: true,
            message: "Policy created successfully",
            data: policy
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};

// Update an existing policy
exports.updatePolicy = async (req, res) => {
    try {
        const { title, content, order, isActive } = req.body;
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({
                status: false,
                message: "Policy not found",
                data: null
            });
        }

        if (title !== undefined) policy.title = title;
        if (content !== undefined) policy.content = content;
        if (order !== undefined) policy.order = Number(order);
        if (isActive !== undefined) policy.isActive = Boolean(isActive);

        await policy.save();

        return res.status(200).json({
            status: true,
            message: "Policy updated successfully",
            data: policy
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};

// Delete a policy
exports.deletePolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({
                status: false,
                message: "Policy not found",
                data: null
            });
        }

        await Policy.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            status: true,
            message: "Policy deleted successfully",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
};
