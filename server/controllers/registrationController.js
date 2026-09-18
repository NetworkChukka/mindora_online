const StudentRegistration = require('../models/StudentRegistration');
const TeacherRegistration = require('../models/TeacherRegistration');
const School = require('../models/School');
const { generateRegistrationId } = require('../services/idGenerator');
const { logAudit } = require('../services/auditService');
const { sanitizePhone } = require('../utils/phoneSanitizer');
const { normalizeName } = require('../utils/textNormalizer');
const {
  broadcastStudentRegistered,
  broadcastStudentUpdated,
  broadcastTeacherRegistered,
  broadcastTeacherUpdated
} = require('../sockets/socketManager');

/**
 * Backend calculation rule for Education Level
 * Grade 6–11 = O/L
 * Grade 12–13 = A/L
 */
function calculateEducationLevel(grade) {
  const g = parseInt(grade);
  if (g >= 6 && g <= 11) {
    return 'O/L';
  } else if (g >= 12 && g <= 13) {
    return 'A/L';
  }
  throw new Error(`Invalid grade: ${grade}. Grade must be between 6 and 13.`);
}

/**
 * REGISTER STUDENT
 */
async function registerStudent(req, res, next) {
  try {
    const {
      studentName,
      schoolId,
      grade,
      phoneNumber = '',
      remarks = '',
      deviceIdentifier = 'Web Browser',
      bypassDuplicateCheck = false
    } = req.body;

    if (!studentName || !studentName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student Name is required.'
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School selection is required.'
      });
    }

    if (!grade) {
      return res.status(400).json({
        success: false,
        message: 'Grade selection is required.'
      });
    }

    // Backend calculates education level (NEVER TRUST FRONTEND!)
    const educationLevel = calculateEducationLevel(grade);

    // Verify school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Selected school was not found.'
      });
    }

    // Duplicate detection check
    if (!bypassDuplicateCheck) {
      const normalizedStudent = normalizeName(studentName);
      const recentStudents = await StudentRegistration.find({
        schoolId,
        grade: parseInt(grade),
        deleted: false
      }).limit(50);

      const possibleMatch = recentStudents.find(s => normalizeName(s.studentName) === normalizedStudent);

      if (possibleMatch) {
        return res.status(409).json({
          success: false,
          warning: true,
          message: 'Possible duplicate student registration found.',
          existingRegistration: {
            registrationNumber: possibleMatch.registrationNumber,
            studentName: possibleMatch.studentName,
            schoolName: possibleMatch.schoolNameSnapshot,
            grade: possibleMatch.grade,
            createdAt: possibleMatch.createdAt
          }
        });
      }
    }

    // Generate atomic registration ID MIN-XXXXXX
    const registrationNumber = await generateRegistrationId('studentSeq', 'MIN', 6);
    const sanitizedPhone = sanitizePhone(phoneNumber);

    const student = await StudentRegistration.create({
      registrationNumber,
      studentName: studentName.trim(),
      schoolId: school._id,
      schoolNameSnapshot: school.schoolName,
      grade: parseInt(grade),
      educationLevel,
      phoneNumber: sanitizedPhone,
      registeredBy: req.user._id,
      registeredByName: req.user.fullName || req.user.username,
      deviceIdentifier,
      remarks: remarks.trim()
    });

    await logAudit({
      user: req.user,
      action: 'OPERATOR_REGISTERED_STUDENT',
      entityType: 'STUDENT',
      entityId: student._id.toString(),
      description: `Registered student ${student.studentName} (${student.registrationNumber}) from ${school.schoolName} - Grade ${grade} (${educationLevel})`,
      req
    });

    // Broadcast real-time socket events
    broadcastStudentRegistered(student);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: student
    });
  } catch (err) {
    next(err);
  }
}

/**
 * REGISTER TEACHER
 */
async function registerTeacher(req, res, next) {
  try {
    const {
      teacherName,
      schoolId,
      phoneNumber = '',
      remarks = '',
      deviceIdentifier = 'Web Browser',
      bypassDuplicateCheck = false
    } = req.body;

    if (!teacherName || !teacherName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Teacher Name is required.'
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School selection is required.'
      });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Selected school was not found.'
      });
    }

    // Duplicate check
    if (!bypassDuplicateCheck) {
      const normalizedTeacher = normalizeName(teacherName);
      const recentTeachers = await TeacherRegistration.find({
        schoolId,
        deleted: false
      }).limit(50);

      const possibleMatch = recentTeachers.find(t => normalizeName(t.teacherName) === normalizedTeacher);

      if (possibleMatch) {
        return res.status(409).json({
          success: false,
          warning: true,
          message: 'Possible duplicate teacher registration found.',
          existingRegistration: {
            registrationNumber: possibleMatch.teacherRegistrationNumber,
            teacherName: possibleMatch.teacherName,
            schoolName: possibleMatch.schoolNameSnapshot,
            createdAt: possibleMatch.createdAt
          }
        });
      }
    }

    // Generate atomic registration ID TCH-XXXXXX
    const teacherRegistrationNumber = await generateRegistrationId('teacherSeq', 'TCH', 6);
    const sanitizedPhone = sanitizePhone(phoneNumber);

    const teacher = await TeacherRegistration.create({
      teacherRegistrationNumber,
      teacherName: teacherName.trim(),
      schoolId: school._id,
      schoolNameSnapshot: school.schoolName,
      phoneNumber: sanitizedPhone,
      registeredBy: req.user._id,
      registeredByName: req.user.fullName || req.user.username,
      deviceIdentifier,
      remarks: remarks.trim()
    });

    await logAudit({
      user: req.user,
      action: 'OPERATOR_REGISTERED_TEACHER',
      entityType: 'TEACHER',
      entityId: teacher._id.toString(),
      description: `Registered teacher ${teacher.teacherName} (${teacher.teacherRegistrationNumber}) from ${school.schoolName}`,
      req
    });

    broadcastTeacherRegistered(teacher);

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully.',
      data: teacher
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get / Search Student Registrations
 */
async function getStudents(req, res, next) {
  try {
    const {
      search = '',
      schoolId,
      grade,
      educationLevel,
      operatorId,
      page = 1,
      limit = 20,
      includeDeleted = false
    } = req.query;

    const query = {};
    if (!includeDeleted) {
      query.deleted = false;
    }

    if (schoolId) query.schoolId = schoolId;
    if (grade) query.grade = parseInt(grade);
    if (educationLevel) query.educationLevel = educationLevel;
    if (operatorId) query.registeredBy = operatorId;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentName: regex },
        { registrationNumber: regex },
        { schoolNameSnapshot: regex },
        { phoneNumber: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      StudentRegistration.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      StudentRegistration.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get / Search Teacher Registrations
 */
async function getTeachers(req, res, next) {
  try {
    const {
      search = '',
      schoolId,
      operatorId,
      page = 1,
      limit = 20,
      includeDeleted = false
    } = req.query;

    const query = {};
    if (!includeDeleted) {
      query.deleted = false;
    }

    if (schoolId) query.schoolId = schoolId;
    if (operatorId) query.registeredBy = operatorId;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { teacherName: regex },
        { teacherRegistrationNumber: regex },
        { schoolNameSnapshot: regex },
        { phoneNumber: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [teachers, total] = await Promise.all([
      TeacherRegistration.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      TeacherRegistration.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: teachers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Edit Student Registration
 */
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { studentName, grade, phoneNumber, remarks, schoolId } = req.body;

    const student = await StudentRegistration.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student registration not found.'
      });
    }

    if (studentName) student.studentName = studentName.trim();
    if (phoneNumber !== undefined) student.phoneNumber = sanitizePhone(phoneNumber);
    if (remarks !== undefined) student.remarks = remarks.trim();

    // If grade changes, backend recalculates education level!
    if (grade && parseInt(grade) !== student.grade) {
      student.grade = parseInt(grade);
      student.educationLevel = calculateEducationLevel(grade);
    }

    if (schoolId && schoolId !== student.schoolId.toString()) {
      const school = await School.findById(schoolId);
      if (school) {
        student.schoolId = school._id;
        student.schoolNameSnapshot = school.schoolName;
      }
    }

    await student.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_EDITED_REGISTRATION',
      entityType: 'STUDENT',
      entityId: student._id.toString(),
      description: `Admin edited student registration ${student.registrationNumber}`,
      req
    });

    broadcastStudentUpdated(student);

    return res.json({
      success: true,
      message: 'Student registration updated.',
      data: student
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Edit Teacher Registration
 */
async function updateTeacher(req, res, next) {
  try {
    const { id } = req.params;
    const { teacherName, phoneNumber, remarks, schoolId } = req.body;

    const teacher = await TeacherRegistration.findById(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher registration not found.'
      });
    }

    if (teacherName) teacher.teacherName = teacherName.trim();
    if (phoneNumber !== undefined) teacher.phoneNumber = sanitizePhone(phoneNumber);
    if (remarks !== undefined) teacher.remarks = remarks.trim();

    if (schoolId && schoolId !== teacher.schoolId.toString()) {
      const school = await School.findById(schoolId);
      if (school) {
        teacher.schoolId = school._id;
        teacher.schoolNameSnapshot = school.schoolName;
      }
    }

    await teacher.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_EDITED_TEACHER',
      entityType: 'TEACHER',
      entityId: teacher._id.toString(),
      description: `Admin edited teacher registration ${teacher.teacherRegistrationNumber}`,
      req
    });

    broadcastTeacherUpdated(teacher);

    return res.json({
      success: true,
      message: 'Teacher registration updated.',
      data: teacher
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Soft Delete Student
 */
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await StudentRegistration.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student registration not found.'
      });
    }

    student.deleted = true;
    student.deletedAt = new Date();
    student.deletedBy = req.user._id;

    await student.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_DELETED_REGISTRATION',
      entityType: 'STUDENT',
      entityId: student._id.toString(),
      description: `Soft deleted student registration ${student.registrationNumber}`,
      req
    });

    broadcastStudentUpdated(student);

    return res.json({
      success: true,
      message: 'Student registration soft-deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Soft Delete Teacher
 */
async function deleteTeacher(req, res, next) {
  try {
    const { id } = req.params;
    const teacher = await TeacherRegistration.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher registration not found.'
      });
    }

    teacher.deleted = true;
    teacher.deletedAt = new Date();
    teacher.deletedBy = req.user._id;

    await teacher.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_DELETED_TEACHER',
      entityType: 'TEACHER',
      entityId: teacher._id.toString(),
      description: `Soft deleted teacher registration ${teacher.teacherRegistrationNumber}`,
      req
    });

    broadcastTeacherUpdated(teacher);

    return res.json({
      success: true,
      message: 'Teacher registration soft-deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerStudent,
  registerTeacher,
  getStudents,
  getTeachers,
  updateStudent,
  updateTeacher,
  deleteStudent,
  deleteTeacher
};
