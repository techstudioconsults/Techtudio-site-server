const bcrypt = require("bcryptjs");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const Admin = require("../models/admin");
const Students = require("../models/studentModel");
const Tutors = require("../models/TutorModel");
const profile = require("../models/profile");

const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { userExist, findUser, whoAreYou } = require("../lib/findUsers");
const {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../lib/token");
const { allTrue, someEquallyTrue } = require("../lib/payloads");

const creds = require("../client_secret.json");

const handleAdminRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const result = allTrue(firstName, lastName, email, phoneNumber, password);

  if (!result) throw createApiError("Incomplete Payload", 422);

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

  const payload = allTrue(
    firstName,
    lastName,
    email,
    phoneNumber,
    schedule,
    course
  );

  if (!payload) {
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
      res
        .status(201)
        .json(handleResponse({ message: "Successful Registration" }));
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

  const payload = allTrue(
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    userRole
  );

  //check if req is from Admin
  if (!role === "ADMIN")
    throw createApiError("Registration can only be done by admin", 401);

  if (!payload) throw createApiError("Incomplete Payload", 422);

  //user identity enforced
  const checkUserRole = someEquallyTrue(userRole, "TUTOR", "STUDENT");
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
      const checkScheduleError = someEquallyTrue(
        schedule.toLowerCase(),
        "weekday",
        "weekend"
      );
      if (!checkScheduleError) {
        throw createApiError("Invalid schedule type", 422);
      }

      //enforcing course options
      const checkCourseError = someEquallyTrue(
        course.toLowerCase(),
        "ui/ux",
        "graphics",
        "android",
        "frontend",
        "backend"
      );

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
  const roleTest = someEquallyTrue(role, "ADMIN", "STUDENT", "TUTOR");
  if (!roleTest) throw createApiError("unAuthorized user", 401);

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
  const refreshToken = createRefreshToken(userId);
  user.refreshToken = [...user.refreshToken, refreshToken];
  user.save();

  res.status(200).json(
    handleResponse({
      message: "user login successful",
      accessToken,
      refreshToken,
      role,
    })
  );
});

const handleRefreshToken = handleAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(400);

  //verify refreshToken
  const { error, user } = verifyRefreshToken(refreshToken);
  if (error) return res.sendStatus(403);

  // //find user
  const foundUser = await profile.findOne({ userId: user.id });
  if (!foundUser) return res.sendStatus(401);

  //find refreshToken
  const rtMatch = foundUser.refreshToken.find((rt) => rt === refreshToken);
  if (!rtMatch) return res.sendStatus(403);

  //generate token
  const accessToken = createToken(user.id, foundUser.role);

  res.status(201).json({ accessToken });
});

const handleLogout = handleAsync(async (req, res) => {
  const user = req.user;
  const { refreshToken } = req.body;
  if (!refreshToken)
    throw createApiError("refresh token is needed to logout", 422);

  //filter out refreshToken out of rotation
  const filteredRefreshToken = user.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  user.refreshToken = filteredRefreshToken;
  user.save();

  res.sendStatus(200);
});

const handleForgotPassword = handleAsync(async (req, res) => {
  const { role, userId } = req.user;
  const { oldPassword, newPassword } = req.body;

  //find user
  const foundUser = await whoAreYou(role, userId)
  
  //compare old password with saved password
  const validPassWd = await bcrypt.compare(oldPassword, foundUser.password);
  if (!validPassWd) throw createApiError("unAuthorized user", 401); 

  //hash new password
  const hashedPwd = await bcrypt.hash(newPassword, 10);

  //save hashedpassword
  foundUser.password = hashedPwd
  await foundUser.save()

  res.status(201).json(handleResponse({ message: "Password change successful" }));
});

const testEndpoint = handleAsync(async (req, res) => {
  res.status(200).json(handleResponse({ message: "it is working" }));
});

module.exports = {
  handleAdminRegister,
  handleStudentRegister,
  handleUserSignUp,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleForgotPassword,
  testEndpoint,
};
