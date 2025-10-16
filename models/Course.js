const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Add missing fields that frontend expects
  category: { type: String, default: 'General' },
  duration_hours: { type: Number, default: 0 },
  max_students: { type: Number, default: 20 },
  requirements: { type: String },
  learning_objectives: [{ type: String }],
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);