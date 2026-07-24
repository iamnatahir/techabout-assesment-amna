const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const reviewerAuth = async (req, res, next) => {
    try {

        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        // Expected format: Bearer <token>
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find reviewer in DB
        const reviewer = await prisma.reviewerUser.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!reviewer) {
            return res.status(401).json({
                success: false,
                message: "Reviewer not found"
            });
        }

        // Only HR can continue
        if (reviewer.role !== "HR") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Save reviewer for next middleware/controller
        req.reviewer = reviewer;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }
};

module.exports = reviewerAuth;