const express = require("express");

const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimiter");

const { login } = require("../controllers/authController");

router.post(
    "/login",
    loginLimiter,
    login
);

module.exports = router;