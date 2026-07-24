const request = require("supertest");
const app = require("../src/app");

describe("Reviewer Authorization", () => {

    test("Should reject request without JWT", async () => {

        const response = await request(app)
            .get("/submissions");

        expect(response.statusCode).toBe(401);

    });

});