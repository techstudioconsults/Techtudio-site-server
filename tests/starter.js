//import library
const request = require("supertest");
const mongoose = require("mongoose");

//import app
const app = require("../server");

//import models

//define consts and lets
let server;
const PORT = 8000;

//Define your suite block
describe("", () => {
  //run this before block tests starts
  beforeAll((done) => {
    mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true });
    server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      done();
    });
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
  describe("", () => {
    test("", async () => {});
  });
});
