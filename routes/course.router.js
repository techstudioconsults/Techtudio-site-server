//import modules
const express = require("express");
const path = require("path");
const multer = require("multer");

//Define consts
const router = express.Router();
const dest = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: dest,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10485760,
  },
});

//import middleware
const { admin } = require("../middlewares/authentication");
const errorHandler = require("../middlewares/errorHandler");

//import controller
const {
  handleGetTutors,
  handleCreateCourse,
  handleGetAllCourses,
  handleGetCourseById,
  handleDeleteCourse,
  handleUpdateCourse,
} = require("../controllers/course.controller");

//get req
router.get("/", admin, handleGetAllCourses);
router.get("/tutors", admin, handleGetTutors);
router.get("/:courseId", admin, handleGetCourseById);

//post req
router.post(
  "/",
  admin,
  upload.fields([{ name: "audio" }, { name: "video" }, { name: "pdf" }]),
  handleCreateCourse
);

//put or patch req
router.patch(
  "/:courseId",
  admin,
  upload.fields([{ name: "audio" }, { name: "video" }, { name: "pdf" }]),
  handleUpdateCourse
);

//delete req
router.delete("/:courseId", admin, handleDeleteCourse);

// custom error handler to handle errors during file upload
router.use(errorHandler);

module.exports = router;
