const express = require('express');
const router = express.Router();
const { createCourse, getTrainerCourses, addParticipant } = require('../controllers/trainerController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('trainer'));
router.post('/courses', createCourse);
router.get('/courses', getTrainerCourses);
router.post('/courses/add-participant', addParticipant);

module.exports = router;