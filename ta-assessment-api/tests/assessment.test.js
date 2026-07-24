const request = require("supertest");
const app = require("../src/app");

describe("Candidate Authentication", () => {

    test("Should return 401 if token is missing", async () => {

        const response = await request(app)
            .get("/assessment");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);

    });

    test("Should return 200 with valid token", async () => {

        const response = await request(app)
            .get("/assessment")
            .set("Authorization", "Bearer token123");

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

    });

});