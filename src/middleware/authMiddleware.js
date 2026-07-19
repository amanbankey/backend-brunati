const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ status: false, message: "Not authorized - Login required", data: null });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ status: false, message: "Session expired or invalid token", data: null });
    }
};

module.exports = authMiddleware;
