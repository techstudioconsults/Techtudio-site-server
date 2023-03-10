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
  const {
    title,
    description,
    duration: { online, weekend, weekday },
    tutors,
  } = req.body;
  const { audio, video, pdf } = req.files;
  const resources = [...(audio || []), ...(video || []), ...(pdf || [])];

  const payload = allTrue(title, description, online, weekend, weekday);
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
    duration: { online, weekend, weekday },
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

  res.status(201).json({ message: "course created", course: newCourse });
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
  if (courses) {
    response = courses.map((course) => {
      return {
        id: course._id,
        courseTitle: course.title,
        courseDuration: course.duration,
        tutors: course.tutors.map((tutor) => {
          return {
            tutorId: tutor._id,
            firstName: tutor.userId.firstName,
            lastName: tutor.userId.lastName,
            avatar: tutor.avatar ?? null,
          };
        }),
      };
    });
  } else {
    response = [];
  }

  res.status(200).json({ courses: response });
};

const handleGetCourseById = handleAsync(async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) throw createApiError("Bad Request", 400);

  const course = await Course.findById(courseId)
    .select("title description duration tutors")
    .populate({
      path: "tutors",
      populate: {
        path: "userId",
        select: "avatar firstName lastName",
      },
    });
  if (!course) throw createApiError("course not found", 404);

  const response = {
    id: course._id,
    title: course.title,
    description: course.description,
    tutors: course.tutors.map((tutor) => {
      return {
        tutorId: tutor._id,
        firstName: tutor.userId.firstName,
        lastName: tutor.userId.lastName,
        avatar: tutor.avatar ?? null,
      };
    }),
  };

  res.status(200).json({ course: response });
});

const handleDeleteCourse = handleAsync(async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) throw createApiError("Bad Request", 400);
  try {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) throw createApiError("Course not found", 404);
  } catch (error) {
    throw createApiError("server error", 500);
  }

  res.sendStatus(204);
});

const handleUpdateCourse = handleAsync(async (req, res) => {
  const {
    title,
    description,
    duration,
    tutors = [], // add default value for tutors
  } = req.body;

  const { audio, video, pdf } = req.files || {}; //add default value if they all come empty
  const { courseId } = req.params;
  if (!courseId) throw createApiError("Bad Request", 400);

  const update = {};
  if (title) update.title = title;
  if (description) update.description = description;
  if (duration) {
    update.duration = {
      ...(duration.online && { online: duration.online }),
      ...(duration.weekend && { weekend: duration.weekend }),
      ...(duration.weekday && { weekday: duration.weekday }),
    };
  }
  if (tutors && tutors.length) update.tutors = tutors;
  if (audio && audio.length)
    update.resources = { audio: audio.map((file) => file.originalname) };
  if (video && video.length)
    update.resources.video = { video: video.map((file) => file.originalname) };
  if (pdf && pdf.length)
    update.resources.pdf = { pdf: pdf.map((file) => file.originalname) };

  try {
    const updatedCourse = await Course.findByIdAndUpdate(courseId, update, {
      new: true,
    });
    if (!updatedCourse) throw createApiError("course not found", 404);
    res.status(200).json({ updatedCourse });
  } catch (error) {
    console.log(error);
    throw createApiError(error.message, error.statusCode);
  }
});

module.exports = {
  handleCreateCourse,
  handleGetTutors,
  handleGetAllCourses,
  handleGetCourseById,
  handleDeleteCourse,
  handleUpdateCourse,
};
