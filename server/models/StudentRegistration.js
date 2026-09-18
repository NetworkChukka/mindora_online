const mongoose = require('mongoose');

const studentRegistrationSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
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
  grade: {
    type: Number,
    required: true,
    enum: [6, 7, 8, 9, 10, 11, 12, 13]
  },
  educationLevel: {
    type: String,
    required: true,
    enum: ['O/L', 'A/L']
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

// Explicit database indexes for fast query performance
studentRegistrationSchema.index({ registrationNumber: 1 }, { unique: true });
studentRegistrationSchema.index({ schoolId: 1, grade: 1, deleted: 1 });
studentRegistrationSchema.index({ phoneNumber: 1 });
studentRegistrationSchema.index({ createdAt: -1 });
studentRegistrationSchema.index({ registeredBy: 1, deleted: 1 });
studentRegistrationSchema.index({ schoolNameSnapshot: 1, deleted: 1 });

module.exports = mongoose.model('StudentRegistration', studentRegistrationSchema);
