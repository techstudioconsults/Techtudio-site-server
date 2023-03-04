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

const tutorInfo = {
  firstName: "tutor",
  lastName: "tutorLast",
  email: "tutor@email.com",
  password: "password",
  phoneNumber: '1234',
  userRole: "TUTOR",
};

const studentInfo = {
    firstName: "student",
    lastName: "studentLast",
    email: "student@email.com",
    password: "password",
    phoneNumber: "1234",
    schedule: "weekday",
    course: "backend",
    userRole: "STUDENT"
}

let server;
const PORT = 8000;

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
  let adminToken;

  describe("POST /api/auth/register/admin", () => {
    test("It should respond with 201 when an admin is created", async () => {
      const response = await request(app)
        .post("/api/auth/register/admin")
        .send(adminInfo);
      expect(response.status).toBe(201);
      expect(response._body.success).toBe(true);
    });

    test("It ensures admin info is saved in DB correctly", async () => {
      // Check that the user was added to the database
      const newUser = await Profile.findOne({ email: adminInfo.email });
      expect(newUser).toBeDefined();
      expect(newUser.firstName).toBe(adminInfo.firstName);

      // Check that the password was hashed correctly
      const isPasswordMatch = await bcrypt.compare(
        adminInfo.password,
        newUser.password
      );
      expect(isPasswordMatch).toBe(true);
    });

    test("It should respond with 409 when the admin already exists", async () => {
      const response = await request(app)
        .post("/api/auth/register/admin")
        .send(adminInfo);
      expect(response.status).toBe(409);
      expect(response._body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login for ADMIN", () => {
    test("It should return a 422 if payload is incompelete", async () => {
      const res = await request(app).post("/api/auth/login").send();
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 404 if the user is not found", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@gmail.com", password: adminInfo.password });
      expect(res.status).toBe(404);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 401 if password is Incorrect", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: adminInfo.email, password: "bad password" });
      expect(res.status).toBe(401);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 200 if login is sucessful", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: adminInfo.email, password: adminInfo.password });
      adminToken = res._body.data.accessToken;
      expect(res.status).toBe(200);
      expect(res._body.success).toBe(true);
      expect(res._body.data.accessToken).toBeDefined();
      expect(res._body.data.refreshToken).toBeDefined();
    });
  });

  describe("POST /api/auth/signup", () => {
    test("It should return a 401 when an admin tries to signup a user without token", async () => {
      const res = await request(app).post("/api/auth/signup").send(tutorInfo);
      expect(res.status).toBe(401);
      expect(res._body.success).toBe(false);
    });

    // test('It should return a 403 when role gotten from token is not that of an Admin', async () => {

    // });

    test("It should return a 422 if payload is incompelete", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send();
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 422 if user role is neither TUTOR nor STUDENT", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "tutor",
          lastName: "tutorLast",
          email: "tutor@email.com",
          password: "password",
          phoneNumber: 1234,
          userRole: "TUTORSS",
        });
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 422 if ADMIN is signing up a student without the right scheduleType", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "tutor",
          lastName: "tutorLast",
          email: "tutor@email.com",
          password: "password",
          phoneNumber: 1234,
          schedule: "week",
          userRole: "STUDENT",
        });
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 422 if ADMIN is signing up a student without the right course", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "tutor",
          lastName: "tutorLast",
          email: "tutor@email.com",
          password: "password",
          phoneNumber: 1234,
          schedule: "weekend",
          course: "backend development",
          userRole: "STUDENT",
        });
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should return a 422 if phoneNumber is Invalid", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "tutor",
          lastName: "tutorLast",
          email: "tutor@email.com",
          password: "password",
          phoneNumber: "1234bduuyyh",
          userRole: "TUTOR",
        });
      expect(res.status).toBe(422);
      expect(res._body.success).toBe(false);
    });

    test("It should sign Up a TUTOR and return a 201", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(tutorInfo);
        console.log(res)
      expect(res.status).toBe(201);
      expect(res._body.success).toBe(true);
    });
    
    test("It should sign Up a STUDENT and return a 201", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(studentInfo);
        console.log(res)
      expect(res.status).toBe(201);
      expect(res._body.success).toBe(true);
    });
  });
});
