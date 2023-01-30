const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");
const { createApiError } = require("../utils/helpers");

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw createApiError("authentication invalid", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) throw createApiError("Token not authorized", 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { userInfo } = payload;

    const user = await Profile.findById(userInfo.userId);

    // Check if user account exists
    if (!user) throw createApiError("Token not authorized", 401);

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    throw createApiError("Session expired", 401);
  }
};

module.exports = authentication;
