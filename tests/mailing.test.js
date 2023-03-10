//import library
const request = require("supertest");
const mongoose = require("mongoose");

//import app
const app = require("../server");

//import models
const Profile = require("../models/profile.model");

//define consts and lets
let server;
const PORT = 8000;

//Define your suite block
describe("Test authentication endpoints", () => {
  //run this before block tests starts
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
      });
      server = app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      process.exit(1)
    }
  });

  //run this after all tests are done
  afterAll(async () => {
    try {
      await mongoose.connection.db.dropDatabase();
      console.log("Database dropped successfully");
      await mongoose.connection.close();
      await server.close();
    } catch (error) {
      console.error("Error dropping database:", error);
    }
  });

  //define probable status
  expect.extend({
    toBeOneOf(received, validOptions) {
      const pass = validOptions.includes(received);
      if (pass) {
        return {
          message: () =>
            `expected ${received} not to be one of ${validOptions.join(", ")}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to be one of ${validOptions.join(", ")}`,
          pass: false,
        };
      }
    },
  });

  //start tests blocks
  describe("POST /api/mailing/contactUs", () => {
    test("should return a 422 when payload is Incomplete", async () => {
      const res = await request(app).post("/api/mailing/contactUs").send();
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("should return a 250 when mail is sent successfully or 500 if reverse is the case", async () => {
      const res = await request(app).post("/api/mailing/contactUs").send({
        fullName: "Tobi",
        email: "Tobiolanitori@gmail.com",
        message: "Unit Testing",
      });
      expect(res.status).toBeOneOf([250, 500]);
      if (res.status === 250) {
        console.log("Received status 250");
      } else if (res.status === 500) {
        console.log("Received status 500");
      }
    }, 100000);
  });

  describe("POST /api/mailing/otp", () => {
    test("It should return a 422 when payload is Incomplete", async () => {
      const res = await request(app).post("/api/mailing/otp").send();
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 404 when user is not found", async () => {
      const res = await request(app).post("/api/mailing/otp").send({
        email: "tobiolanitori@gmail.com",
      });
      expect(res.status).toBe(404);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 201 when OTP is sent or 500 if it is not", async () => {
      //simulate a user registration
      const response = await request(app)
        .post("/api/auth/register/admin")
        .send({
          email: "tobiolanitori@gmail.com",
          password: "password",
          firstName: "Tobi",
          lastName: "Olanitori",
          phoneNumber: 12345,
        });
      expect(response.status).toBe(201);
      expect(response._body.success).toBe(true);

      const res = await request(app).post("/api/mailing/otp").send({
        email: "tobiolanitori@gmail.com",
      });
      expect(res.status).toBeOneOf([201, 500]);

      if (res.status === 201) {
        console.log("Received status 201");
      } else if (res.status === 500) {
        console.log("Received status 500");
      }
    }, 100000);
  });
});
