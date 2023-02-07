const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Students = require("../models/studentModel");
const Tutors = require("../models/TutorModel");
const profile = require("../models/profile");
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { userExist, findUser } = require("../lib/findUsers");
const { createToken } = require("../lib/token");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../client_secret.json");

const handleAdminRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password)
    throw createApiError("Incomplete Payload", 422);

  if (parseInt(phoneNumber) === Number) {
    throw createApiError("Valid Phone number required", 400);
  }

  if (await userExist(email, Admin))
    throw createApiError(`Admin with ${email} already exist`, 409);

  const hashedPwd = await bcrypt.hash(password, 10);
  try {
    await Admin.create({
      firstName,
      lastName,
      email,
      phoneNumber: parseInt(phoneNumber),
      password: hashedPwd,
    });
  } catch (error) {
    console.log(error);
    throw createApiError("Admin registration failed", 500);
  }

  res
    .status(201)
    .json(
      handleResponse({ role: "ADMIN", message: "Admin sign up successful" })
    );
});

const handleStudentRegister = handleAsync(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    schedule,
    course,
    newsletter,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !course ||
    !schedule
  ) {
    throw createApiError("Incomplete payload", 422);
  } else {
    const spreadSheetId = process.env.SPREADSHEET_ID;
    const doc = new GoogleSpreadsheet(spreadSheetId);

    try {
      await doc.useServiceAccountAuth(creds);
      await doc.getInfo();
      const sheet = doc.sheetsByTitle["Techstudio"];
      await sheet.addRow({
        firstName,
        lastName,
        email,
        phoneNumber: parseInt(phoneNumber),
        schedule,
        course,
        newsletter,
      });
      res.status(201).json(handleResponse("Successful Registration"));
    } catch (error) {
      throw createApiError(error.message, 500);
    }
  }
});

const handleUserSignUp = handleAsync(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    schedule,
    course,
    newsletter,
    userRole,
  } = req.body;
  //role gotten from auth middleware
  const { role } = req.user;

  //check if req is from Admin
  if (!role === "ADMIN")
    throw createApiError("Registration can only be done by admin", 401);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phoneNumber ||
    !userRole
  )
    throw createApiError("Incomplete Payload", 422);

  //user identity enforced
  const checkUserRole = ["TUTOR", "STUDENT"].some(
    (value) => value === userRole
  );
  if (!checkUserRole) throw createApiError("Invalid user type", 422);

  if (isNaN(parseInt(phoneNumber)))
    throw createApiError("Invalid phoneNumber", 422);

  const hashedPwd = await bcrypt.hash(password, 10);

  //signup as a student
  if (userRole === "STUDENT") {
    //check if student exist
    if (await userExist(email, profile)) {
      throw createApiError("user with " + email + " already exist");
    } else {
      if (!schedule || !course) {
        throw createApiError("students schedule and course are required", 422);
      }
      //enforcing schedule options
      const checkScheduleError = ["weekday", "weekend"].some(
        (value) => value === schedule.toLowerCase()
      );

      if (!checkScheduleError) {
        throw createApiError("Invalid schedule type", 422);
      }

      //enforcing course options
      const checkCourseError = [
        "ui/ux",
        "graphics",
        "android",
        "frontend",
        "backend",
      ].some((value) => value === course.toLowerCase());

      if (!checkCourseError) {
        throw createApiError("Invalid course type", 422);
      }

      await Students.create({
        firstName,
        lastName,
        email,
        password: hashedPwd,
        phoneNumber: parseInt(phoneNumber),
        schedule,
        course,
        newsletter,
      });
    }

    //signup as a tutor
  } else if (userRole === "TUTOR") {
    if (await userExist(email, profile)) {
      throw createApiError("user with " + email + " already exist");
    } else {
      await Tutors.create({
        firstName,
        lastName,
        email,
        password: hashedPwd,
        phoneNumber: parseInt(phoneNumber),
      });
    }
  }

  res.status(201).json(handleResponse({ message: "user sign up successful" }));
});

const handleLogin = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw createApiError("Incomplete Payload", 422);

  const user = await findUser(email, profile);

  if (!user) throw createApiError("user not found", 404);

  const { role, userId } = user;

  if (!role === "ADMIN" || !role === "STUDENT" || !role === "TUTOR") {
    throw createApiError("unAuthorized user", 401);
  }

  let foundUser;
  switch (role) {
    case "ADMIN":
      foundUser = await findUser(email, Admin);
      break;
    case "STUDENT":
      foundUser = await findUser(email, Students);
      break;
    case "TUTOR":
      foundUser = await findUser(email, Tutors);
      break;
    default:
      break;
  }

  if (!foundUser) throw createApiError("user not found", 404);

  const validPassWd = await bcrypt.compare(password, foundUser.password);

  if (!validPassWd) throw createApiError("unAuthorized user", 401);

  const accessToken = createToken(userId, role);

  res
    .status(200)
    .json(
      handleResponse({ message: "user login successful", accessToken, role })
    );
});

module.exports = {
  handleAdminRegister,
  handleStudentRegister,
  handleUserSignUp,
  handleLogin,
};
