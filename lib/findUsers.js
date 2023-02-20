const Admin = require("../models/admin");
const Students = require("../models/studentModel");
const Tutors = require("../models/TutorModel");

const userExist = async (_email, User) => {
  const user = await User.findOne({ email: _email });
  if (user) {
    return true;
  }
  return false;
};

const findUser = async (_email, User) => {
  const user = await User.findOne({ email: _email });
  if (user) {
    return user;
  } else {
    return false;
  }
};

async function whoAreYou (role, id) {
  let foundUser;
  switch (role) {
    case "ADMIN":
      foundUser = await Admin.findById(id);
      break;
    case "STUDENT":
      foundUser = await Students.findById(id);
      break;
    case "TUTOR":
      foundUser = await Tutors.findById(id);
      break;
    default:
      break;
  }

  return foundUser
}

module.exports = { userExist, findUser, whoAreYou };
