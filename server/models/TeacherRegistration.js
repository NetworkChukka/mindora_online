const mongoose = require('mongoose');

const teacherRegistrationSchema = new mongoose.Schema({
  teacherRegistrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  schoolNameSnapshot: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredByName: {
    type: String,
    required: true
  },
  deviceIdentifier: {
    type: String,
    default: 'Web Browser'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Explicit database indexes for fast query execution
teacherRegistrationSchema.index({ teacherRegistrationNumber: 1 }, { unique: true });
teacherRegistrationSchema.index({ schoolId: 1, deleted: 1 });
teacherRegistrationSchema.index({ phoneNumber: 1 });
teacherRegistrationSchema.index({ createdAt: -1 });
teacherRegistrationSchema.index({ registeredBy: 1, deleted: 1 });
teacherRegistrationSchema.index({ schoolNameSnapshot: 1, deleted: 1 });

module.exports = mongoose.model('TeacherRegistration', teacherRegistrationSchema);
