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

const handleAdminRegister = handleAsync(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password)
    throw createApiError("Incomplete Payload", 422);

  if (await userExist(email, Admin))
    throw createApiError(`Admin with ${email} already exist`, 409);

  const hashedPwd = await bcrypt.hash(password, 10);
  try {
    await Admin.create({
      firstName,
      lastName,
      email,
      phoneNumber,
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
  const { firstName, lastName, email, phoneNumber, schedule, newsletter } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !schedule) {
    throw createApiError("Incomplete payload", 422);
  } else {
    if (await userExist(email, Students)) {
      throw createApiError("user already exist", 409);
    } else {
      const checkSchedule = ['weekday', 'weekend'].some(item => {
        schedule === item
      })
      if(!checkSchedule) throw createApiError('invalid schedule property', 400)
      try {
        Students.create({
          firstName,
          lastName,
          email,
          phoneNumber,
          schedule,
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
  const { email, password, AdminRole } = req.body;

  if (!email || !password || !AdminRole)
    throw createApiError("Incomplete Payload");

  const foundUser = await findUser(email, Students);
  if (!foundUser) throw createApiError("user not found", 404);

  const hashedPwd = await bcrypt.hash(password, 10);

  foundUser.password = hashedPwd;
  await foundUser.save();

  res
    .status(201)
    .json(handleResponse({ role: 201, message: "Student sign up successful" }));
});

const handleLogin = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw createApiError("Incomplete Payload", 422);

  const user = await findUser(email, profile);

  if (!user) throw createApiError("user not found", 404);

  const { role } = user;

  if (role !== 101 || role !== 201 || role !== 301) {
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

  res.status(200).json(handleResponse({ message: "user login successful" }));
});

module.exports = {
  handleRegister,
  handleAdminRegister,
  handleCompleteRegistration,
  handleLogin,
};
