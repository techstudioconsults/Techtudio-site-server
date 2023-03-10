const jwt = require("jsonwebtoken");

function createToken(id, role) {
  const accessToken = jwt.sign(
    {
      userInfo: { id, role },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  return accessToken;
}

function createRefreshToken(id) {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return { error: true, status: 403, user: "" };
    }
    return { error: false, status: 200, user };
  });
}

function passwordResetToken(id) {
  return jwt.sign({ id }, process.env.RESET_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.RESET_TOKEN_SECRET, (err, user) => {
    if (err) {
      return { error: true, status: 403, user: "" };
    }
    return { error: false, status: 200, user };
  });
}

module.exports = {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
  passwordResetToken,
  verifyResetToken,
};
