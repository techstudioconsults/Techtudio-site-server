// import User from "../models/user";
// import jwt from "jsonwebtoken"

async function authentication (req) {

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return { status: 401, error: true, message: 'authentication invalid'}
    }

    const token = authHeader.split(" ")[1];

    if (!token) return { status: 401, error: true, message: 'Token not authorized'}

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { id } = payload;

    const user = await User.findOne({_id: id});

    // Check if user account exists
    if (!user) return { status: 404, error: true, message: 'user not found'}
    return {status: 200, error: false, user: user}
  } catch (error) {
    console.error(error);

    return { status: 401, error: true, message: error}
  }
}

export default authentication;