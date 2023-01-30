const bcrypt = require("bcryptjs");
const Students = require("../models/studentModel");
const Admin = require("../models/admin");
const profile = require("../models/profile");
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { userExist, findUser } = require("../lib/findUsers");
const { createToken } = require("../lib/token");

const handleAdminRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password)
    throw createApiError("Incomplete Payload", 422);

    if(parseInt(phoneNumber) === Number) {
      throw createApiError("Valid Phone number required", 400)
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
    .json(handleResponse({ role: 101, message: "Admin sign up successful" }));
});

const handleRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, schedule, course, newsletter } = req.body;
  console.log(schedule)

  if (!firstName || !lastName || !email || !phoneNumber || !course || !schedule) {
    throw createApiError("Incomplete payload", 422);
  } else {
    if (await userExist(email, Students)) {
      throw createApiError("user already exist", 409);
    } else {
      if(parseInt(phoneNumber) === Number) {
        throw createApiError("Valid Phone number required", 400)
      }
      const checkSchedule = ['weekday', 'weekend'].some(item => item === schedule)
      if(!checkSchedule) throw createApiError('invalid schedule property', 400)
      try {
        await Students.create({
          firstName,
          lastName,
          email,
          phoneNumber: parseInt(phoneNumber),
          schedule,
          course: course.toLowerCase(),
          newsletter: newsletter
        });
      } catch (error) {
        return createApiError("Registration failed", 500);
      }

      res
        .status(201)
        .json(handleResponse({ message: firstName + " " + "account created" }));
    }
  }
});

const handleCompleteRegistration = handleAsync(async (req, res) => {
  const { email, password } = req.body;
  const { role } = req.user;

  if(!role === 101) throw createApiError('Registration can only be done by admin', 401)

  if (!email || !password)
    throw createApiError("Incomplete Payload", 422);

  const foundUser = await findUser(email, Students);
  if (!foundUser) throw createApiError("user not found", 404);

  const hashedPwd = await bcrypt.hash(password, 10);

  foundUser.password = hashedPwd;
  await foundUser.save();

  res
    .status(201)
    .json(handleResponse({ message: "Student sign up successful" }));
});

const handleLogin = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw createApiError("Incomplete Payload", 422);

  const user = await findUser(email, profile);

  if (!user) throw createApiError("user not found", 404);

  
  const { role, userId } = user;
  
  if (!role === 101 || !role === 201 || !role === 301) {
    throw createApiError("unAuthorized user", 401);
  }

  let foundUser;
  switch (role) {
    case 101:
      foundUser = await findUser(email, Admin);
      break;
    case 201:
      foundUser = await findUser(email, Students);
    default:
      break;
  }

  if (!foundUser) throw createApiError("user not found", 404);

  const validPassWd = await bcrypt.compare(password, foundUser.password);

  if (!validPassWd) throw createApiError("unAuthorized user", 401);

  const accessToken = createToken(userId, role)

  res.status(200).json(handleResponse({ message: "user login successful", accessToken, role }));
});

module.exports = {
  handleRegister,
  handleAdminRegister,
  handleCompleteRegistration,
  handleLogin,
};
