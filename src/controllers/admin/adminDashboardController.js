const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Review = require("../../models/Review");

exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Date ranges for charts
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(now.getDate() - 28);
        fourWeeksAgo.setHours(0, 0, 0, 0);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        // --- Orders & Revenue ---
        const [
            totalOrders,
            ordersToday,
            ordersThisMonth,
            revenueAgg,
            revenueTodayAgg,
            revenueThisMonthAgg,
            revenueLastMonthAgg,
            ordersByStatus,
            recentOrders,
            weeklySalesAgg,
            monthlySalesAgg,
            yearlySalesAgg
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: startOfToday } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // All-time revenue (only paid or delivered orders)
            Order.aggregate([
                { $match: { orderStatus: { $nin: ["cancelled"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            // Revenue today
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfToday }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            // Revenue this month
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            // Revenue last month (for growth comparison)
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            // Orders grouped by status
            Order.aggregate([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
            ]),

            // 5 most recent activities (status updates)
            Order.find().sort({ updatedAt: -1 }).limit(5).select("orderId customer.name totalAmount orderStatus createdAt updatedAt"),


            // Weekly Sales Trend (Last 7 days)
            Order.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                    amount: { $sum: "$totalAmount" } 
                }},
                { $sort: { _id: 1 } }
            ]),

            // Monthly Sales Trend (Last 28 days grouped by week - simplified)
            Order.aggregate([
                { $match: { createdAt: { $gte: fourWeeksAgo }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { 
                    _id: { $ceil: { $divide: [ { $subtract: [ now, "$createdAt" ] }, 1000 * 60 * 60 * 24 * 7 ] } },
                    amount: { $sum: "$totalAmount" } 
                }},
                { $sort: { _id: -1 } }
            ]),

            // Yearly Sales Trend (Last 12 months)
            Order.aggregate([
                { $match: { createdAt: { $gte: twelveMonthsAgo }, orderStatus: { $nin: ["cancelled"] } } },
                { $group: { 
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
                    amount: { $sum: "$totalAmount" } 
                }},
                { $sort: { _id: 1 } }
            ])
        ]);

        // --- Products ---
        const [totalProducts] = await Promise.all([
            Product.countDocuments({ isActive: true })
        ]);
        const lowStockProducts = [];
        const outOfStockProducts = 0;


        // --- Users ---
        const [totalUsers, newUsersToday, newUsersThisMonth] = await Promise.all([
            User.countDocuments({ isAdmin: false }),
            User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfToday } }),
            User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfMonth } })
        ]);

        // --- Reviews ---
        const totalReviews = await Review.countDocuments();

        // --- Build revenue growth % ---
        const revenueThisMonthVal = revenueThisMonthAgg[0]?.total || 0;
        const revenueLastMonthVal = revenueLastMonthAgg[0]?.total || 0;
        const revenueGrowth = revenueLastMonthVal === 0
            ? 100
            : Math.round(((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100);

        // --- Format Chart Data ---
        const formatWeeklyData = () => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const result = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const match = weeklySalesAgg.find(item => item._id === dateStr);
                result.push({
                    name: days[date.getDay()],
                    amount: match ? match.amount : 0
                });
            }
            return result;
        };

        const formatMonthlyData = () => {
            const result = [];
            for (let i = 4; i >= 1; i--) {
                const match = monthlySalesAgg.find(item => item._id === i);
                result.push({
                    name: `Week ${5-i}`,
                    amount: match ? match.amount : 0
                });
            }
            return result;
        };

        const formatYearlyData = () => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const result = [];
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthYear = date.toISOString().substring(0, 7); // "YYYY-MM"
                const match = yearlySalesAgg.find(item => item._id === monthYear);
                result.push({
                    name: months[date.getMonth()],
                    amount: match ? match.amount : 0
                });
            }
            return result;
        };

        // --- Build order status map ---
        const statusMap = {};
        ordersByStatus.forEach(s => { statusMap[s._id] = s.count; });

        const totalRev = revenueAgg[0]?.total || 0;
        const avgOrderVal = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

        res.json({
            status: true,
            message: "Dashboard data fetched successfully",
            data: {
                revenue: {
                    allTime:    totalRev,
                    today:      revenueTodayAgg[0]?.total || 0,
                    thisMonth:  revenueThisMonthVal,
                    lastMonth:  revenueLastMonthVal,
                    growthPercent: revenueGrowth,
                    avgOrderValue: avgOrderVal
                },
                orders: {
                    total:      totalOrders,
                    today:      ordersToday,
                    thisMonth:  ordersThisMonth,
                    byStatus:   statusMap,
                    recent:     recentOrders
                },
                charts: {
                    week: formatWeeklyData(),
                    month: formatMonthlyData(),
                    year: formatYearlyData()
                },
                products: {
                    totalActive:    totalProducts,
                    outOfStock:     outOfStockProducts,
                    lowStock:       lowStockProducts
                },
                users: {
                    total:          totalUsers,
                    newToday:       newUsersToday,
                    newThisMonth:   newUsersThisMonth
                },
                reviews: {
                    total: totalReviews
                }
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

