const request = require("supertest");
const app = require("../src/app");

describe("HR Login", () => {

    test("Should login successfully", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({

                email: "hr@gmail.com",

                password: "123456"

            });

        expect(response.statusCode).toBe(200);

        expect(response.body.token).toBeDefined();

    });

    test("Should reject wrong password", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({

                email: "hr@gmail.com",

                password: "wrongpassword"

            });

        expect(response.statusCode).toBe(401);

    });

});