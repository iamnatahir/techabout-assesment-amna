const express = require("express");
const app = express();
app.use(express.json());

const assessmentRoutes = require("./routes/assessmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/assessment", assessmentRoutes);
app.use("/submissions", submissionRoutes);
app.use("/", authRoutes);
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TA Assessment API Running"
    });
});

module.exports = app;