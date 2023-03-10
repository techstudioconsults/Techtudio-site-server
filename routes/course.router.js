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

// const fileFilter = function (req, file, cb) {
//   const allowedTypes = /jpeg|jpg|png|mp4|mp3|pdf/;
//   const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimeType = allowedTypes.test(file.mimetype);
//   if (ext && mimeType) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only jpeg, jpg, png, mp4, mp3 and pdf files are allowed!"));
//   }
// };

const upload = multer({
  storage: storage,
  // fileFilter: fileFilter,
  limits: {
    fileSize: 10485760,
    // files: 3,
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
} = require("../controllers/course.controller");

//get req
router.get("/", admin, handleGetAllCourses);
router.get("/tutors", admin, handleGetTutors);

//post req
router.post(
  "/",
  admin,
  upload.fields([{ name: "audio" }, { name: "video" }, { name: "pdf" }]),
  handleCreateCourse
);

//put or patch req

//delete req

// custom error handler to handle errors during file upload
router.use(errorHandler);

module.exports = router;
