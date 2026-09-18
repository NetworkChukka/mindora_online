const StudentRegistration = require('../models/StudentRegistration');
const TeacherRegistration = require('../models/TeacherRegistration');
const School = require('../models/School');

const TIMEZONE = process.env.APP_TZ || 'Asia/Colombo';

/**
 * Get Real-Time Overview Statistics
 */
async function getStats(req, res, next) {
  try {
    const baseStudentQuery = { deleted: false };
    const baseTeacherQuery = { deleted: false };

    // Calculate start of today in Asia/Colombo local timezone
    const now = new Date();
    const localDateStr = now.toLocaleDateString('en-US', { timeZone: TIMEZONE });
    const startOfTodayLocal = new Date(`${localDateStr} 00:00:00 GMT+0530`);

    const [
      totalStudents,
      totalTeachers,
      olStudents,
      alStudents,
      totalSchools,
      todayStudents,
      todayTeachers
    ] = await Promise.all([
      StudentRegistration.countDocuments(baseStudentQuery),
      TeacherRegistration.countDocuments(baseTeacherQuery),
      StudentRegistration.countDocuments({ ...baseStudentQuery, educationLevel: 'O/L' }),
      StudentRegistration.countDocuments({ ...baseStudentQuery, educationLevel: 'A/L' }),
      School.countDocuments({ status: 'ACTIVE' }),
      StudentRegistration.countDocuments({ ...baseStudentQuery, createdAt: { $gte: startOfTodayLocal } }),
      TeacherRegistration.countDocuments({ ...baseTeacherQuery, createdAt: { $gte: startOfTodayLocal } })
    ]);

    const totalVisitors = totalStudents + totalTeachers;
    const todaysRegistrations = todayStudents + todayTeachers;

    return res.json({
      success: true,
      data: {
        totalVisitors,
        totalStudents,
        totalTeachers,
        olStudents,
        alStudents,
        totalSchools,
        todaysRegistrations,
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Grade Distribution (Grades 6 to 13)
 */
async function getGradeStats(req, res, next) {
  try {
    const grades = [6, 7, 8, 9, 10, 11, 12, 13];
    const pipeline = [
      { $match: { deleted: false } },
      { $group: { _id: '$grade', count: { $sum: 1 } } }
    ];

    const results = await StudentRegistration.aggregate(pipeline);

    const gradeMap = {};
    results.forEach(r => { gradeMap[r._id] = r.count; });

    const distribution = grades.map(g => ({
      grade: `Grade ${g}`,
      rawGrade: g,
      level: g <= 11 ? 'O/L' : 'A/L',
      count: gradeMap[g] || 0
    }));

    return res.json({
      success: true,
      data: distribution
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get School Statistics (Visitors, Students, Teachers, O/L, A/L per school)
 */
async function getSchoolStats(req, res, next) {
  try {
    const schools = await School.find({ status: 'ACTIVE' }).lean();

    const [studentGroup, teacherGroup] = await Promise.all([
      StudentRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$schoolId',
            totalStudents: { $sum: 1 },
            olStudents: {
              $sum: { $cond: [{ $eq: ['$educationLevel', 'O/L'] }, 1, 0] }
            },
            alStudents: {
              $sum: { $cond: [{ $eq: ['$educationLevel', 'A/L'] }, 1, 0] }
            }
          }
        }
      ]),
      TeacherRegistration.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: '$schoolId', totalTeachers: { $sum: 1 } } }
      ])
    ]);

    const sMap = {};
    studentGroup.forEach(g => { sMap[g._id.toString()] = g; });

    const tMap = {};
    teacherGroup.forEach(g => { tMap[g._id.toString()] = g; });

    const stats = schools.map(s => {
      const sData = sMap[s._id.toString()] || { totalStudents: 0, olStudents: 0, alStudents: 0 };
      const tData = tMap[s._id.toString()] || { totalTeachers: 0 };
      const visitors = sData.totalStudents + tData.totalTeachers;

      return {
        schoolId: s._id,
        schoolName: s.schoolName,
        city: s.city,
        totalVisitors: visitors,
        totalStudents: sData.totalStudents,
        totalTeachers: tData.totalTeachers,
        olStudents: sData.olStudents,
        alStudents: sData.alStudents
      };
    }).sort((a, b) => b.totalVisitors - a.totalVisitors);

    return res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Operator Registration Statistics
 */
async function getOperatorStats(req, res, next) {
  try {
    const [studentOps, teacherOps] = await Promise.all([
      StudentRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$registeredBy',
            operatorName: { $first: '$registeredByName' },
            students: { $sum: 1 }
          }
        }
      ]),
      TeacherRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$registeredBy',
            operatorName: { $first: '$registeredByName' },
            teachers: { $sum: 1 }
          }
        }
      ])
    ]);

    const opMap = {};

    studentOps.forEach(o => {
      if (o._id) {
        opMap[o._id.toString()] = {
          operatorId: o._id,
          operatorName: o.operatorName,
          students: o.students,
          teachers: 0
        };
      }
    });

    teacherOps.forEach(o => {
      if (o._id) {
        const key = o._id.toString();
        if (opMap[key]) {
          opMap[key].teachers = o.teachers;
        } else {
          opMap[key] = {
            operatorId: o._id,
            operatorName: o.operatorName,
            students: 0,
            teachers: o.teachers
          };
        }
      }
    });

    const list = Object.values(opMap).map(o => ({
      ...o,
      totalVisitors: o.students + o.teachers
    })).sort((a, b) => b.totalVisitors - a.totalVisitors);

    return res.json({
      success: true,
      data: list
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Hourly Registration Timeline (Timezone-Aware Asia/Colombo + 12-Hour AM/PM labels)
 */
async function getHourlyStats(req, res, next) {
  try {
    const studentHourly = await StudentRegistration.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: { $hour: { date: '$createdAt', timezone: TIMEZONE } },
          count: { $sum: 1 }
        }
      }
    ]);

    const teacherHourly = await TeacherRegistration.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: { $hour: { date: '$createdAt', timezone: TIMEZONE } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Exhibition hours: 0 (12 AM) to 23 (11 PM)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const sMap = {};
    studentHourly.forEach(h => { if (h._id !== null) sMap[h._id] = h.count; });
    const tMap = {};
    teacherHourly.forEach(h => { if (h._id !== null) tMap[h._id] = h.count; });

    const timeline = hours.map(h => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 === 0 ? 12 : h % 12;
      const label = `${formattedHour} ${ampm}`;

      return {
        hour: label,
        rawHour: h,
        students: sMap[h] || 0,
        teachers: tMap[h] || 0,
        total: (sMap[h] || 0) + (tMap[h] || 0)
      };
    });

    return res.json({
      success: true,
      data: timeline
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getGradeStats,
  getSchoolStats,
  getOperatorStats,
  getHourlyStats
};
