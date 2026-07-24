const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {

    // Hash HR password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Candidate 1
    await prisma.candidate.create({
        data: {
            name: "Amna",
            email: "amna@gmail.com",
            city: "Lahore",
            role: "Backend Developer",
            privateToken: "token123"
        }
    });

    // Candidate 2
    await prisma.candidate.create({
        data: {
            name: "Ali",
            email: "ali@gmail.com",
            city: "Karachi",
            role: "Backend Developer",
            privateToken: "token456"
        }
    });

    // HR
    await prisma.reviewerUser.create({
        data: {
            name: "HR Manager",
            email: "hr@gmail.com",
            password: hashedPassword,
            role: "HR"
        }
    });

    // Assessment
    await prisma.assessmentBrief.create({
        data: {
            title: "Backend Assessment",
            description: "Create Recruitment API",
            deadline: new Date("2026-08-01")
        }
    });

    console.log("Database Seeded Successfully!");
}

main()
.catch(console.error)
.finally(async () => {
    await prisma.$disconnect();
});