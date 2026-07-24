const request = require("supertest");
const prisma = require("../src/config/prisma");
const app = require("../src/app");

describe("Audit Log", () => {

    test("Should create audit log after submission", async () => {

        await request(app)
            .post("/submissions")
            .set("Authorization", "Bearer token456")
            .send({

                assessmentId: 1,

                workLink: "https://github.com/test",

                fileReference: "file.zip",

                timeTaken: "3 hours",

                notes: "Done",

                challenges: "None"

            });

        const log = await prisma.auditLog.findFirst({

            where: {

                action: "Submission Created"

            },

            orderBy: {

                createdAt: "desc"

            }

        });

        expect(log).not.toBeNull();

    });

});