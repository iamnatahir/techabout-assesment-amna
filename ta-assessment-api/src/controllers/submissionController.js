const prisma = require("../config/prisma");



const createSubmission = async (req, res) => {

    try {
 
        const {
            assessmentId,
            workLink,
            timeTaken,
            notes,
            challenges
        } = req.body;
        const uploadedFile = req.file ? req.file.path : null;

        if (
            !assessmentId ||
            !workLink ||
            !uploadedFile ||
            !timeTaken
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        const existingSubmission = await prisma.submission.findUnique({
            where: {
                candidateId_assessmentId: {
                    candidateId: req.candidate.id,
                    assessmentId
                }
            }
        });

        if (existingSubmission) {
            return res.status(409).json({
                success: false,
                message: "Submission already exists"
            });
        }

        const submission = await prisma.submission.create({
            data: {
                candidateId: req.candidate.id,
                assessmentId,
                workLink,
                fileReference: uploadedFile,
                timeTaken,
                notes,
                challenges,
                status: "Pending"
            }
        });

        await prisma.auditLog.create({
            data: {
                submissionId: submission.id,
                action: "Submission Created",
                performedBy: req.candidate.name
            }
        });

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            data: submission
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// GET /submissions — HR lists submissions with optional filters + pagination
const getSubmissions = async (req, res) => {

    try {

        const {
            role,
            status,
            city,
            minScore,
            maxScore,
            submittedFrom,
            submittedTo,
            page = "1",
            limit = "10"
        } = req.query;

        // Convert page/limit to numbers for Prisma skip/take
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Build where clause only with filters that were actually sent
        const where = {};

        // status lives on Submission itself
        if (status) {
            where.status = status;
        }

        // role and city live on Candidate — filter through the relation
        if (role || city) {
            where.candidate = {};

            if (role) {
                where.candidate.role = role;
            }

            if (city) {
                where.candidate.city = city;
            }
        }

        // submittedAt date range on Submission
        if (submittedFrom || submittedTo) {
            where.submittedAt = {};

            // gte = greater than or equal (start of range)
            if (submittedFrom) {
                where.submittedAt.gte = new Date(submittedFrom);
            }

            // lte = less than or equal (end of range)
            if (submittedTo) {
                where.submittedAt.lte = new Date(submittedTo);
            }
        }

        // score lives on Review — filter through the optional review relation
        if (minScore || maxScore) {
            where.review = {
                score: {}
            };

            if (minScore) {
                where.review.score.gte = parseInt(minScore, 10);
            }

            if (maxScore) {
                where.review.score.lte = parseInt(maxScore, 10);
            }
        }

        // Run count + findMany together so we get total pages without extra round trips
        const [total, submissions] = await Promise.all([
            prisma.submission.count({ where }),
            prisma.submission.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    submittedAt: "desc"
                },
                // include avoids N+1: one query loads candidate, assessment, and review
                include: {
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            city: true,
                            role: true
                        }
                    },
                    assessment: {
                        select: {
                            id: true,
                            title: true,
                            deadline: true
                        }
                    },
                    review: {
                        select: {
                            score: true,
                            decision: true,
                            reviewNote: true,
                            reviewedAt: true
                        }
                    }
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            data: submissions,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const getAllSubmissions = async (req, res) => {

    try {

        // Query Parameters
        const {
            role,
            status,
            city,
            minScore,
            maxScore,
            submittedDate,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};

        // Candidate Filters
        if (role || city) {

            filters.candidate = {};

            if (role)
                filters.candidate.role = role;

            if (city)
                filters.candidate.city = city;
        }

        // Submission Status
        if (status) {
            filters.status = status;
        }

       if (minScore || maxScore) {

    filters.review = {

        is: {

            score: {}

        }

    };

    if (minScore)
        filters.review.is.score.gte = Number(minScore);

    if (maxScore)
        filters.review.is.score.lte = Number(maxScore);

}

        // Submitted Date
        if (submittedDate) {

            const start = new Date(submittedDate);

            const end = new Date(submittedDate);

            end.setDate(end.getDate() + 1);

            filters.createdAt = {
                gte: start,
                lt: end
            };

        }

        const submissions = await prisma.submission.findMany({

            where: filters,

            include:{

                        candidate:{

                    select:{

                        id:true,

                        name:true,

                        city:true,

                        role:true,

                        email:true

                    }

                },

                assessment:{

                    select:{

                        title:true,

                        deadline:true

                    }

                },

                review:{

                    select:{

                        score:true,

                        decision:true,

                        reviewNote:true

                    }

                }

            },

            orderBy: {

                createdAt: "desc"

            },

            skip: (page - 1) * limit,

            take: Number(limit)

        });

        const total = await prisma.submission.count({
            where: filters
        });

        return res.status(200).json({

            success: true,

            total,

            currentPage: Number(page),

            totalPages: Math.ceil(total / limit),

            data: submissions

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

const reviewSubmission = async (req, res) => {

    try {

        const submissionId = Number(req.params.id);

        const {
            score,
            decision,
            reviewNote
        } = req.body;

        // Validation
        if (
            score === undefined ||
            !decision ||
            !reviewNote
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Score validation
        if (score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 0 and 100"
            });
        }

        // Decision validation
        if (!["Accepted", "Rejected"].includes(decision)) {
            return res.status(400).json({
                success: false,
                message: "Decision must be Accepted or Rejected"
            });
        }

        // Find submission
        const submission = await prisma.submission.findUnique({
            where: {
                id: submissionId
            },
            include: {
                review: true
            }
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Prevent reviewing twice
        if (submission.review) {
            return res.status(409).json({
                success: false,
                message: "Submission already reviewed"
            });
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {

            const review = await tx.review.create({

                data: {

                    submissionId,

                    reviewerId: req.reviewer.id,

                    score,

                    decision,

                    reviewNote

                }

            });

            await tx.submission.update({

                where: {

                    id: submissionId

                },

                data: {

                    status: "Reviewed"

                }

            });

            await tx.auditLog.create({

                data: {

                    submissionId,

                    action: "Submission Reviewed",

                    performedBy: req.reviewer.name

                }

            });

            return review;

        });

        return res.status(200).json({

            success: true,

            message: "Submission reviewed successfully",

            data: result

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
    createSubmission,
    getSubmissions,
    getAllSubmissions,
    reviewSubmission
};