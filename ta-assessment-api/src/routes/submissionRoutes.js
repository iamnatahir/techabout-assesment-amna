const express = require("express");

const router = express.Router();

const candidateAuth = require("../middleware/candidateAuth");
const reviewerAuth = require("../middleware/reviewerAuth");

const {
    createSubmission,
    getSubmissions
} = require("../controllers/submissionController");

// Candidate creates a submission
router.post("/", candidateAuth, createSubmission);

// HR lists submissions (filters + pagination)
router.get("/", reviewerAuth, getSubmissions);

module.exports = router;
