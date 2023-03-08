const bcrypt = require("bcryptjs");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const Students = require("../models/student.model");
const Profile = require("../models/profile.model");
const UserOTP = require("../models/otp.model");

const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");
const { userExist, findUser } = require("../lib/findUsers");
const {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
  passwordResetToken,
  verifyResetToken,
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

  if (await userExist(email, Profile))
    throw createApiError(`Admin with ${email} already exist`, 409);

  const hashedPwd = await bcrypt.hash(password, 10);
  try {
    const newAdmin = new Profile({
      firstName,
      lastName,
      email,
      phoneNumber: parseInt(phoneNumber),
      password: hashedPwd,
      role: "ADMIN",
    });
    await newAdmin.save();
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
  const user = req.user;

  // console.log(user)

  const payload = allTrue(
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    userRole
  );

  //check if req is from Admin
  if (user.role !== "ADMIN")
    throw createApiError("Registration can only be done by admin", 403);

  if (!payload) throw createApiError("Incomplete Payload", 422);

  //user identity enforced
  const checkUserRole = someEquallyTrue(userRole, "TUTOR", "STUDENT");
  if (!checkUserRole) throw createApiError("Invalid user type", 422);

  const parsedNum = parseInt(phoneNumber);
  const isNumber = parsedNum.toString() == phoneNumber;
  if(!isNumber) throw createApiError("Invalid phoneNumber", 422);

  const hashedPwd = await bcrypt.hash(password, 10);

  //signup as a student
  if (userRole === "STUDENT") {
    //check if student exist
    if (await userExist(email, Profile)) {
      throw createApiError("user with " + email + " already exist", 409);
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

      const newUser = new Profile({
        firstName,
        lastName,
        email,
        password: hashedPwd,
        phoneNumber: parseInt(phoneNumber),
        role: userRole,
      });
      await newUser.save();

      //find student model
      const student = await Students.findById(newUser._id);
      if (!student) throw createApiError("oops", 500);

      student.schedule = schedule;
      student.course = course;
      student.newsletter = newsletter;
      await student.save();
    }
    //signup as a tutor
  } else if (userRole === "TUTOR") {
    if (await userExist(email, Profile)) {
      throw createApiError("user with " + email + " already exist", 409);
    } else {
      await Profile.create({
        firstName,
        lastName,
        email,
        password: hashedPwd,
        phoneNumber: parseInt(phoneNumber),
        role: userRole,
      });
    }
  }

  res.status(201).json(handleResponse({ message: "user sign up successful" }));
});

const handleLogin = handleAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw createApiError("Incomplete Payload", 422);

  const user = await findUser(email, Profile);
  if (!user) throw createApiError("user not found", 404);

  const { _id, role } = user;

  const validPassWd = await bcrypt.compare(password, user.password);
  if (!validPassWd) throw createApiError("unAuthorized user", 401);

  const accessToken = createToken(_id, role);
  const refreshToken = createRefreshToken(_id);
  user.refreshToken = user.refreshToken
    ? [...user.refreshToken, refreshToken]
    : [refreshToken];
  await user.save();

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
  const foundUser = await Profile.findById(user.id);
  if (!foundUser) return res.sendStatus(401);

  //find refreshToken to make sure an old refresh token is not being used
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

  res.status(200).json(handleResponse({ message: "successful logout" }));
});

const handleChangePassword = handleAsync(async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  //compare old password with saved password
  const validPassWd = await bcrypt.compare(oldPassword, user.password);
  if (!validPassWd) throw createApiError("unAuthorized user", 401);

  //hash new password
  const hashedPwd = await bcrypt.hash(newPassword, 10);

  //save hashedpassword
  user.password = hashedPwd;
  await user.save();

  res
    .status(201)
    .json(handleResponse({ message: "Password change successful" }));
});

const handleForgotPassword = handleAsync(async (req, res) => {

  //Before getting to this step, a user has to verify email first.
  //Verifying an email starts from the handleOTP in the mailing controller
  //OTP received via email is then verified using the handleOTPVerification
  //After all is done, a user can then change their password

  const { password } = req.body;
  const authHeader = req.headers.authorization;

  //authenticate user
  if (!authHeader || !authHeader.startsWith("Bearer"))
    throw createApiError("authentication invalid", 401);

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "Token not authorized",
    });
  }

  //verify resetToken
  const { error, user } = verifyResetToken(token);
  if (error) throw createApiError("Expired token", 403);

  //find user
  const foundUser = await Profile.findById(user.id);
  if (!foundUser) throw createApiError("user not found", 404);

  //hash new password
  const hashedPwd = await bcrypt.hash(password, 10);

  //update in db
  foundUser.password = hashedPwd;
  foundUser.save();

  res
    .status(201)
    .json(handleResponse({ message: "Password change successful" }));
});

const handleOTPVerification = handleAsync(async (req, res) => {
  const { otp, email } = req.body;
  if (!otp || !email) throw createApiError("Invalid payload", 422);

  const id = await Profile.findOne({ email }).select("_id");
  if (!id) throw createApiError("user not found", 404);

  const verifiable = await UserOTP.findById(id._id);
  if (!verifiable) throw createApiError("Invalid OTP", 403);

  const isMatch = await Promise.all(
    verifiable.otps.map(async (item) => {
      const compare = await bcrypt.compare(otp, item.otp);
      if (compare) {
        return item;
      } else {
        return null;
      }
    })
  );
  const matchedOTP = isMatch.find((item) => item !== null);
  if (!matchedOTP) throw createApiError("not found", 404);

  if (matchedOTP.expiresAT < Date.now()) {
    await UserOTP.deleteMany({ _id: id._id });
    throw createApiError("otp exipired", 403);
  } else {
    const resetToken = passwordResetToken(id._id);
    await UserOTP.deleteMany({ _id: id._id });
    res.status(202).json(
      handleResponse({
        status: "VERIFIED",
        message: "verification successful",
        resetToken,
      })
    );
  }
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
  handleChangePassword,
  handleForgotPassword,
  handleOTPVerification,
  testEndpoint,
};
