//library

//models
const Course = require("../models/course.model");
const Profile = require("../models/profile.model");
const Tutor = require("../models/tutor.model");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payloads");

const handleGetTutors = handleAsync(async (req, res) => {
  const tutors = await Tutor.find().populate({
    path: "userId",
    select: "firstName lastName",
  });

  let response;
  if (tutors) {
    response = tutors.map((tutor) => {
      return {
        id: tutor.id,
        firstName: tutor.userId.firstName,
        lastName: tutor.userId.lastName,
      };
    });
  } else {
    response = [];
  }

  res.status(200).json({ tutors: response });
});

const handleCreateCourse = handleAsync(async (req, res) => {
  const { title, description, duration, tutors } = req.body;
  const { audio, video, pdf } = req.files;
  const resources = [...audio, ...video, ...pdf];

  const payload = allTrue(title, description, duration);
  if (!payload) throw createApiError("Incomplete Payload", 422);
  if (tutors && !Array.isArray(tutors))
    throw createApiError("Bad Request", 400);

  const duplicate = await Course.findOne({ title });
  if (duplicate) throw createApiError("Course Title already exits", 409);

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

const handleGetAllCourses = async (req, res) => {

  const courses = await Course.find()
  .select("title duration tutors")
  .populate({
    path: "tutors",
    populate: {
      path: "userId",
      select: "avatar firstName lastName",
    },
  });

  let response;
  if(courses) {
    response = courses.map((course) => {
      return {
        id: course._id,
        courseTitle: course.title,
        courseDuration: course.duration,
        tutors: course.tutors.map(tutor => {
          return {
            tutorId: tutor._id,
            firstName: tutor.userId.firstName,
            lastName: tutor.userId.lastName,
            avatar: tutor.avatar ?? null
          }
        })
      }
    })
  } else {
    response = []
  }

  res.status(200).json({ courses: response });
};

module.exports = {
  handleCreateCourse,
  handleGetTutors,
  handleGetAllCourses,
};
