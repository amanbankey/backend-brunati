const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {

    try {

        // Accept token from httpOnly cookie (browser) or Bearer header (API clients)
        let token = req.cookies?.adminToken;


        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({ status: false, message: "Authentication required", data: null });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            const msg = jwtError.name === "TokenExpiredError" ? "Session expired" : "Invalid session";
            return res.status(401).json({ status: false, message: msg, data: null });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user || !user.isAdmin) {
            return res.status(403).json({ status: false, message: "Admin access required", data: null });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);
        res.status(500).json({ status: false, message: "Server authentication error", data: null });
    }

};

module.exports = adminMiddleware;
