require("dotenv").config();
const {
  test,
  describe,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const request = require("supertest");
const { ConnectDB, DisconnectDB, ClearDB } = require("./testDBConfig");

const app = require("../routes/authRouter");

// /* Connecting to the database before each test. */
// beforeEach(async () => {
//     await mongoose.connect(process.env.MONGODB_URL);
//   });

//   /* Closing database connection after each test. */
//   afterEach(async () => {
//     await mongoose.connection.close();
//   });

// describe("POST /api/auth/register", () => {
//   it("should register students", async (done) => {
//     const res = await request(app).post("/api/auth/register").send({
//       firstName: "test1",
//       lastName: "user1",
//       email: "testuser6@gmail.com",
//       phoneNumber: "081111166777",
//       course: "graphics",
//       schedule: "weekend",
//       newsletter: false
//     });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.length).toBeGreaterThan(0);
//     done()
//   });
// });

describe("Auth", () => {
  // Run this before running any auth test
  beforeAll(async (done) => {
    // Connect to test database
    await ConnectDB(process.env.MONGO_URI_TEST);
    // Drop all collections in the db
    // await ClearDB();
    done()
  });

  // Run this after all auth tests have been executed
  afterAll(async (done) => {
    // Drop all collections in the db
    // await ClearDB();
    // Disconnect from database
    await DisconnectDB();
    done()
  });

  test("should successfully register a student", async (done) => {
    // Make request to /api/auth/signup endpoint
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test1",
      lastName: "user1",
      email: "testuser6@gmail.com",
      phoneNumber: "081111166777",
      course: "graphics",
      schedule: "weekend",
      newsletter: false,
    });
    // Test for success response
    expect(response.statusCode).toBe(201);
    done()

    // Test response body
    // expect(response.body.id).toBeDefined();
    expect(response.body.message).toBe("Successful Registration");
    done()
  });

  // test("should fail to signup user with error 422", async () => {
  //   // Make request to /api/auth/signup endpoint
  //   const response = await request(app).post("/api/auth/signup").send({
  //     password: testPassword,
  //   });

  //   // Test for success response
  //   expect(response.statusCode).toBe(422);
  // });

  // test("should successfully login user", async () => {
  //   // Make request to /api/auth/login endpoint
  //   const response = await request(app).post("/api/auth/login").send({
  //     email: testUserEmail,
  //     password: testPassword,
  //   });

  //   // Test for success response
  //   expect(response.statusCode).toBe(201);

  //   // Test response body
  //   expect(response.body.message).toBeDefined();
  //   expect(response.body.token).toBeDefined();
  //   expect(response.body.userId).toBeDefined();
  // });

  // test("should fail to login user 401", async () => {
  //   // Make request to /api/auth/login endpoint
  //   const response = await request(app).post("/api/auth/login").send({
  //     email: testUserEmail,
  //     password: "wrongpassworde",
  //   });

  //   // Test for success response
  //   expect(response.statusCode).toBe(401);
  // });
});
