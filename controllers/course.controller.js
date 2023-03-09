//library

//models
const Course = require("../models/course.model");
const Profile = require("../models/profile.model");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payloads");
const { uploadResources } = require("../lib/clouds");

const handleGetTutors = handleAsync(async (req, res) => {
  const user = req.user;
  if (user.role !== "ADMIN")
    throw createApiError("access to resource denied", 403);

  const tutors = await Profile.find()
    .where("role")
    .equals("TUTOR")
    .select("firstName lastName");

  res.status(200).json({ tutors });
});

const handleCreateCourse = handleAsync(async (req, res) => {
  const user = req.user;
  if (user.role !== "ADMIN")
    throw createApiError("access to resource denied", 403);

  const { title, description, duration, tutors } = req.body;
  const { audio, video, pdf } = req.files;
  const resources = [...audio, ...video, ...pdf];

  const payload = allTrue(title, description, duration);
  if (!payload) throw createApiError("Incomplete Payload", 422);

  const uploadedResources = await uploadResources({ resources, title });
  console.log(uploadedResources);

  //   const newCourse = new Course({
  //     title,
  //     description,
  //     duration,
  //     tutors: [...tutors],
  //     resources: {
  //       audio: [],
  //       videos: [],
  //       pdf: [],
  //     },
  //   });
  res.status(201).json({ message: "created" });
});

module.exports = {
  handleCreateCourse,
  handleGetTutors,
};
