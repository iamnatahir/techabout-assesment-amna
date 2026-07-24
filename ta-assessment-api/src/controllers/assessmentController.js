const prisma = require("../config/prisma");

const getAssessment = async (req, res) => {

    try {

        const assessment = await prisma.assessmentBrief.findFirst();

        return res.status(200).json({

            success: true,

            candidate: req.candidate.name,

            data: assessment

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

module.exports = {
    getAssessment
};