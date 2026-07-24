const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Both fields are required for login
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find reviewer by email
        const reviewer = await prisma.reviewerUser.findUnique({
            where: { email }
        });

        // Wrong email — do not reveal whether email or password failed
        if (!reviewer) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare plain password with hashed password from DB
        const isPasswordValid = await bcrypt.compare(password, reviewer.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT with reviewer id and role inside the payload
        const token = jwt.sign(
            {
                id: reviewer.id,
                role: reviewer.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
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
