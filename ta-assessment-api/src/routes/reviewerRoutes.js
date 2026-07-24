const express = require("express");

const router = express.Router();

const reviewerAuth = require("../middleware/reviewerAuth");

router.get("/profile", reviewerAuth, (req, res) => {

    res.json({
        success: true,
        reviewer: req.reviewer
    });

});

module.exports = router;