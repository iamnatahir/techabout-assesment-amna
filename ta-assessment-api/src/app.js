const express = require("express");
const app = express();
app.use(express.json());

const assessmentRoutes = require("./routes/assessmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewerRoutes = require("./routes/reviewerRoutes");
const upload = require("./middleware/ upload.js");
const candidateAuth =require('./middleware/candidateAuth.js')
const {
    createSubmission
} = require("./controllers/submissionController");
const morgan = require("morgan");

app.use(morgan("dev"));
app.post(
    "/",
    candidateAuth,
    upload.single("file"),
    createSubmission
);

app.use("/reviewer", reviewerRoutes);
app.use("/assessment", assessmentRoutes);
app.use("/submissions", submissionRoutes);
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TA Assessment API Running"
    });
});

module.exports = app;