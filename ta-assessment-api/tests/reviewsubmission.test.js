const request = require("supertest");
const app = require("../src/app");

describe("Review Validation", () => {

    let token;

    beforeAll(async () => {

        const login = await request(app)

            .post("/auth/login")

            .send({

                email: "hr@gmail.com",

                password: "123456"

            });

        token = login.body.token;

    });

    test("Should reject invalid score", async () => {

        const response = await request(app)

            .patch("/submissions/1/review")

            .set("Authorization", `Bearer ${token}`)

            .send({

                score: 150,

                decision: "Accepted",

                reviewNote: "Excellent"

            });

        expect(response.statusCode).toBe(400);

    });

});