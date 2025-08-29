const Course = require('../models/Course');
const createError = require('http-errors');

const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, trainer: req.user._id });
    res.status(201).json(course);
  } catch (err) {
    next(createError(400, err.message));
  }
};

const getTrainerCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ trainer: req.user._id })
      .populate('participants', 'firstName lastName email')
      .sort({ startDate: 1 });

    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const addParticipant = async (req, res, next) => {
  try {
    const { courseId, userId } = req.body;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('participants', 'firstName lastName email');

    res.json(course);
  } catch (err) {
    next(err);
  }
};

module.exports = { createCourse, getTrainerCourses, addParticipant };