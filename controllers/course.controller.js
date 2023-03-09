//library

//models
const Courses = require('../models/course.model');

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers

const handleCreateCourse = handleAsync(async (req, res) => {
    const user = req.user;
    const { title, description, duration, tutors, resources } = req.body;
    const files = req.files;

    console.log(files)

    res.sendStatus(201);


})

module.exports = {
    handleCreateCourse,
};
