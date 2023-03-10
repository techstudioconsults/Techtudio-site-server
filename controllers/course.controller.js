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

  const { title, description, duration, tutors } = req.body;
  const { audio, video, pdf } = req.files;
  const resources = [...audio, ...video, ...pdf];

  const payload = allTrue(title, description, duration);
  if (!payload) throw createApiError("Incomplete Payload", 422);
  if (!Array.isArray(tutors)) throw createApiError("Bad Request", 400);
  
  const duplicate = await Course.findOne({ title });
  if(duplicate) throw createApiError("Course Title already exits", 409);
  
  const result = {
    audio: [],
    video: [],
    pdf: [],
  };


  resources.forEach((resource) => {
    if (resource.fieldname === "audio") {
      result.audio.push(resource.originalname);
    } else if (resource.fieldname === "video") {
      result.video.push(resource.originalname);
    } else {
      result.pdf.push(resource.originalname);
    }
  });

  const newCourse = new Course({
    title,
    description,
    duration,
    tutors: [...tutors],
    resources: result,
  });

  try {
    await newCourse.save();
  } catch (error) {
    if (error.code === 11000)
      throw createApiError("Course Title already exits", 409);
    else throw createApiError("server error", 500);
  }

  res.status(201).json({ message: "course created" });
});

module.exports = {
  handleCreateCourse,
  handleGetTutors,
};
