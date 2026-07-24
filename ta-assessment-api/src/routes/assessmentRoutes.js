const express = require("express");

const router = express.Router();

const {
    getAssessment
} = require("../controllers/assessmentController");

const candidateAuth = require("../middleware/candidateAuth");

// Protected Route
router.get("/", candidateAuth, getAssessment);

module.exports = router;