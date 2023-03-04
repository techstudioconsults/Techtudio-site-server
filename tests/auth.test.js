//import library
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//import app
const app = require("../server");

//import models
const Profile = require("../models/profile");
const Admin = require("../models/admin");
// cons

const adminInfo = {
  email: "test@example.com",
  password: "password",
  firstName: "Tobi",
  lastName: "Olanitori",
  phoneNumber: 12345,
};

let server;
const PORT = process.env.MONGO_URI_TEST;

describe("Test authentication endpoints", () => {
  beforeAll((done) => {
    mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true });
    server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      done();
    });
  });

  afterAll(async () => {
    try {
      await mongoose.connection.db.dropDatabase();
      console.log("Database dropped successfully");
      await mongoose.connection.close();
      await mongoose.connection.close();
      await server.close();
    } catch (error) {
      console.error("Error dropping database:", error);
    }
  });

  describe("POST /api/auth/register/admin", () => {
    test("It should respond with 201 when an admin is created", async () => {
      const response = await request(app)
        .post("/api/auth/register/admin")
        .send(adminInfo);
      expect(response.status).toBe(201);
      expect(response._body.success).toBe(true);

      //   // Check that the user was added to the database
      //   const newUser = await Profile.findOne({ email: adminInfo.email });
      //   expect(newUser).toBeDefined();
      //   expect(newUser.firstName).toBe(adminInfo.firstName);

      //   // Check that the password was hashed correctly
      //   const isPasswordMatch = await bcrypt.compare(
      //     adminInfo.password,
      //     newUser.password
      //   );
      //   expect(isPasswordMatch).toBe(true);
    });
    // test("It should respond with 409 when the user already exists", async () => {
    //   return request(app)
    //     .post("/api/auth/register/admin")
    //     .send({ email: "test@example.com", password: "password", firstName: 'Tobi', lastName: 'Olanitori', phoneNumber: 12345 })
    //     .expect(409)
    //     .then((response) => {
    //         expect(response.success).toBe(false);
    //     });
    // });
  });
});
