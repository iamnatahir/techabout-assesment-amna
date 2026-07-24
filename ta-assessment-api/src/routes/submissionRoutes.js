const express = require("express");
const router = express.Router();

const candidateAuth = require("../middleware/candidateAuth");
const reviewerAuth = require("../middleware/reviewerAuth");
const upload = require("../middleware/ upload");
const { submissionLimiter } = require("../middleware/rateLimiter");

const {
    createSubmission,
    getAllSubmissions,
    reviewSubmission
} = require("../controllers/submissionController");

router.post(
    "/",
    submissionLimiter,
    candidateAuth,
    upload.single("file"),
    createSubmission
);

router.get("/", reviewerAuth, getAllSubmissions);

router.patch(
    "/:id/review",
    reviewerAuth,
    reviewSubmission
);

module.exports = router;