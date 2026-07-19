const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const COOKIE_OPTIONS = {
    httpOnly: true,                                     // JS cannot read the cookie
    secure: process.env.NODE_ENV === "production",      // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site support if needed
    maxAge: 7 * 24 * 60 * 60 * 1000,                   // 7 days
    path: "/",                                          // Available across all routes
};

/**
 * POST /api/v1/admin/login
 * Body: { email, password }
 * Returns admin user info + sets httpOnly JWT cookie.
 */
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input presence
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required",
                data: null,
            });
        }

        // 2. Find user by email (case-insensitive and trimmed)
        const emailLower = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailLower });
        
        // 3. Gate: must exist, must be admin, must have a password set
        if (!user) {
            return res.status(401).json({ status: false, message: "User not found", data: null });
        }
        
        if (!user.isAdmin) {
            return res.status(401).json({ status: false, message: "Access denied: Not an administrator", data: null });
        }

        if (!user.password) {
            return res.status(401).json({ status: false, message: "Account setup incomplete", data: null });
        }

        // 4. Verify password (bcrypt)
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid credentials",
                data: null,
            });
        }

        // 5. Sign JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Set httpOnly cookie (same pattern as adminMiddleware expects)
        res.cookie("adminToken", token, COOKIE_OPTIONS);

        // 7. Return safe user payload (no password)
        return res.status(200).json({
            status: true,
            message: "Login successful",
            data: {
                id:      user._id,
                name:    user.name,
                email:   user.email,
                phone:   user.phone,
                isAdmin: user.isAdmin,
                token:   token,
            },
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

/**
 * GET /api/v1/admin/check-auth
 * Returns user info if token is valid (requires adminMiddleware).
 */
exports.checkAuth = async (req, res) => {
    // req.user is already populated by adminMiddleware if the token is valid
    return res.status(200).json({
        status: true,
        isLoggedIn: true,
        data: {
            id:      req.user._id,
            name:    req.user.name,
            email:   req.user.email,
            phone:   req.user.phone,
            isAdmin: req.user.isAdmin,
        },
    });
};

/**
 * PUT /api/v1/admin/profile
 * Updates the admin's database profile (name, phone, password).
 */
exports.updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, newPass } = req.body;
        const user = await User.findById(req.user._id);

        if (!user || !user.isAdmin) {
            return res.status(401).json({ status: false, message: "Unauthorized", data: null });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (newPass && newPass.length >= 8) user.password = newPass;

        await user.save();

        return res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            data: {
                id:      user._id,
                name:    user.name,
                email:   user.email,
                phone:   user.phone,
                isAdmin: user.isAdmin,
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message, data: null });
    }
};

/**
 * POST /api/v1/admin/forgot-password
 * Body: { email, newPassword }
 * Resets admin password if email matches an admin user.
 */
exports.adminForgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ status: false, message: "Email and new password are required", data: null });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ status: false, message: "Password must be at least 8 characters", data: null });
        }

        const emailLower = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailLower });

        if (!user || !user.isAdmin) {
            return res.status(404).json({ status: false, message: "No admin account found with this email", data: null });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            status: true,
            message: "Admin password reset successfully",
            data: null
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message, data: null });
    }
};

/**
 * POST /api/v1/admin/logout
 * Clears the httpOnly cookie.
 */
exports.adminLogout = (req, res) => {
    const { maxAge, ...clearOptions } = COOKIE_OPTIONS;
    res.clearCookie("adminToken", clearOptions);
    return res.status(200).json({ status: true, message: "Logged out", data: null });
};

