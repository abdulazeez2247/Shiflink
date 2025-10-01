// Update routes/trainer.js
const express = require('express');
const router = express.Router();
const { 
  createCourse, 
  getTrainerCourses, 
  addParticipant,
  getTrainerStats, // Add this
  updateCourse,    // Add this
  deleteCourse     // Add this
} = require('../controllers/trainerController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('trainer'));

router.get('/stats', getTrainerStats); // Add this route
router.post('/courses', createCourse);
router.get('/courses', getTrainerCourses);
router.put('/courses/:id', updateCourse); // Add this route
router.delete('/courses/:id', deleteCourse); // Add this route
router.post('/courses/add-participant', addParticipant);

module.exports = router;