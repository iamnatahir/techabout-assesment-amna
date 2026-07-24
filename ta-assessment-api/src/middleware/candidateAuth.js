const prisma = require("../config/prisma");

const candidateAuth = async (req, res, next) => {

    try {

        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        // Header format: Bearer token123
        const token = authHeader.split(" ")[1];

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        // Find candidate in database
        const candidate = await prisma.candidate.findUnique({
            where: {
                privateToken: token
            }
        });

        // Invalid token
        if (!candidate) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            });
        }

        // Save candidate for later use
        req.candidate = candidate;

        // Continue to controller
        next();

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = candidateAuth;