const prisma = require("../config/prisma");

const createSubmission = async (req, res) => {

    try {

        const {
            assessmentId,
            workLink,
            fileReference,
            timeTaken,
            notes,
            challenges
        } = req.body;

        if (
            !assessmentId ||
            !workLink ||
            !fileReference ||
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
                fileReference,
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

module.exports = {
    createSubmission,
    getSubmissions
};