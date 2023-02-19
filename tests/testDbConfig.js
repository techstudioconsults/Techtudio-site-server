const mongoose = require("mongoose");

exports.ConnectDB = async (MONGODB_URL) => {
  try {
    return await mongoose.connect(MONGODB_URL);
  } catch (error) {
    console.log(error.message);
  }
};

exports.ClearDB = async () => {
  const profiles = await mongoose.connection.db.profiles();

  for (let profile of profiles) {
    await profile.deleteMany({});
  }
};

exports.DisconnectDB = async () => {
  return await mongoose.disconnect();
};