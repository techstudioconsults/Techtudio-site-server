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

module.exports = { userExist, findUser };
