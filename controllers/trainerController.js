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
// Add to controllers/trainerController.js
const getTrainerStats = async (req, res, next) => {
  try {
    const trainerId = req.user._id;
    
    // Get courses for this trainer
    const courses = await Course.find({ trainer: trainerId });
    
    // Calculate stats
    const totalCourses = courses.length;
    const totalParticipants = courses.reduce((sum, course) => sum + (course.participants?.length || 0), 0);
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0), 0);
    
    // Count upcoming courses (courses with start date in future)
    const upcomingCourses = courses.filter(course => 
      course.startDate && new Date(course.startDate) > new Date()
    ).length;

    res.json({
      totalCourses,
      totalParticipants,
      totalRevenue,
      upcomingCourses
    });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: id, trainer: req.user._id },
      updates,
      { new: true }
    ).populate('participants', 'firstName lastName email');

    if (!course) {
      throw createError(404, 'Course not found');
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findOneAndDelete({
      _id: id,
      trainer: req.user._id
    });

    if (!course) {
      throw createError(404, 'Course not found');
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCourse, getTrainerCourses, addParticipant, getTrainerStats, updateCourse, deleteCourse };
