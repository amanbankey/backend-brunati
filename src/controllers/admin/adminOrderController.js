const Order = require("../../models/Order");
const sendEmail = require("../../utils/emailService");

/**
 * GET /api/v1/admin/orders
 * Supports search, filtering by status, and pagination.
 */
exports.getAllOrders = async (req, res) => {
    try {
        const { search, paymentStatus, orderStatus, sortBy = 'newest', page = 1, limit = 20 } = req.query;
        
        const query = {};

        // 🔍 Search Logic (Order ID or Customer Name)
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { "customer.name": { $regex: search, $options: 'i' } }
            ];
        }

        // 🎯 Filtering Logic
        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus.toLowerCase();
        }
        if (orderStatus && orderStatus !== 'all') {
            query.orderStatus = orderStatus.toLowerCase();
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // 📊 Sorting Logic
        let sort = { createdAt: -1 };
        if (sortBy === 'oldest') sort = { createdAt: 1 };
        if (sortBy === 'total-high') sort = { totalAmount: -1 };
        if (sortBy === 'total-low') sort = { totalAmount: 1 };

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ 
            status: true, 
            message: "Orders fetched successfully", 
            data: {
                data: orders,
                pagination: { 
                    total, 
                    page: parseInt(page), 
                    limit: parseInt(limit), 
                    totalPages: Math.ceil(total / parseInt(limit)) 
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate("userId")
            .populate("items.productId")
            .populate({
                path: 'freeSample.productId'
            });


        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found", data: null });
        }
        res.json({ status: true, message: "Success", data: order });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body; // Adjusted to match frontend expectation
        
        let order = await Order.findOne({ orderId: req.params.orderId }).populate("userId", "name email");
        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found", data: null });
        }

        // Idempotency check: if already at this status, don't trigger emails again!
        if (order.orderStatus === status) {
            return res.json({ status: true, message: "Status already updated", data: order });
        }

        order.orderStatus = status;
        await order.save();

        // Email notifications (Awaited for Vercel reliability)
        if (order.customer?.email) {
            try {
                if (status === "shipped") {
                    await sendEmail({
                        email: order.customer.email,
                        subject: `Your Brunati Order #${order.orderId} Has Shipped! 🚚`,
                        message: `Hello ${order.customer.name || 'valued customer'},\n\nGreat news! Your luxury fragrance order #${order.orderId} has been shipped.\n\nThank you for choosing Brunati.`
                    });
                } else if (status === "delivered") {
                    await sendEmail({
                        email: order.customer.email,
                        subject: `Your Brunati Order #${order.orderId} Has Been Delivered! 📦`,
                        message: `Hello ${order.customer.name || 'valued customer'},\n\nYour order #${order.orderId} has been delivered! We hope you love your new fragrance.`
                    });
                }
            } catch (err) {
                console.error("Email notification failed:", err.message);
            }
        }

        // Respond after email attempts
        res.json({ status: true, message: "Status updated successfully", data: order });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};


exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId }, 
            { paymentStatus: status }, 
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found", data: null });
        }

        res.json({ status: true, message: "Payment status updated successfully", data: order });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

/**
 * PATCH /api/v1/admin/orders/bulk-update
 * Body: { orderIds: [], updates: { orderStatus, paymentStatus } }
 */
exports.bulkUpdateOrders = async (req, res) => {
    try {
        const { orderIds, updates } = req.body;
        
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ status: false, message: "No order IDs provided", data: null });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ status: false, message: "No update fields provided", data: null });
        }

        const result = await Order.updateMany(
            { orderId: { $in: orderIds } },
            { $set: updates }
        );

        res.json({ 
            status: true, 
            message: `Successfully updated ${result.modifiedCount} orders`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

/**
 * DELETE /api/v1/admin/orders/bulk-delete
 * Body: { orderIds: [] }
 */
exports.bulkDeleteOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ status: false, message: "No order IDs provided", data: null });
        }

        const result = await Order.deleteMany({ orderId: { $in: orderIds } });

        res.json({ 
            status: true, 
            message: `Successfully deleted ${result.deletedCount} orders`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};


