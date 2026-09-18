const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  eventName: {
    type: String,
    default: 'MINDORA'
  },
  subtitle: {
    type: String,
    default: 'MICROBIOLOGY EXHIBITION'
  },
  eventDate: {
    type: String,
    default: '2026-09-18'
  },
  venue: {
    type: String,
    default: 'University Science Faculty Grounds'
  },
  logo: {
    type: String,
    default: '/assets/mindora-logo.png'
  },
  studentPrefix: {
    type: String,
    default: 'MIN'
  },
  teacherPrefix: {
    type: String,
    default: 'TCH'
  },
  allowedGrades: {
    type: [Number],
    default: [6, 7, 8, 9, 10, 11, 12, 13]
  },
  duplicateDetection: {
    type: Boolean,
    default: true
  },
  eventDayMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
