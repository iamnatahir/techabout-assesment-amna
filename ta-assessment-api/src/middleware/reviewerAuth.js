const jwt = require("jsonwebtoken");

const reviewerAuth = (req, res, next) => {

    try {

        // Get Authorization header (format: Bearer <token>)
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        // Split "Bearer <token>" and take the token part
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        // Verify token signature and expiry using JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only HR reviewers can access protected HR routes
        if (decoded.role !== "HR") {
            return res.status(403).json({
                success: false,
                message: "Access denied. HR role required"
            });
        }

        // Attach reviewer info for controllers to use later
        req.reviewer = decoded;

        next();

    } catch (error) {

        // jwt.verify throws if token is invalid or expired
        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });

    }

};

module.exports = reviewerAuth;
