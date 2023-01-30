const jwt = require("jsonwebtoken");

function createToken(id, role) {
  const accessToken = jwt.sign(
    {
      userInfo: { id, role },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5h",
    }
  );
  return accessToken;
}

module.exports = { createToken };
