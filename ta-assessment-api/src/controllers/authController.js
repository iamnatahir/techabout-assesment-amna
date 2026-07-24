const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        // Find reviewer
        const reviewer = await prisma.reviewerUser.findUnique({
            where: {
                email
            }
        });

        if (!reviewer) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            reviewer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: reviewer.id,
                role: reviewer.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    login
};