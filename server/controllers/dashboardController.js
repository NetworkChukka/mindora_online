const StudentRegistration = require('../models/StudentRegistration');
const TeacherRegistration = require('../models/TeacherRegistration');
const School = require('../models/School');

const TIMEZONE = process.env.APP_TZ || 'Asia/Colombo';
const QUERY_TIMEOUT_MS = 5000; // 5 second max execution timeout for aggregation queries

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
      StudentRegistration.countDocuments(baseStudentQuery).maxTimeMS(QUERY_TIMEOUT_MS),
      TeacherRegistration.countDocuments(baseTeacherQuery).maxTimeMS(QUERY_TIMEOUT_MS),
      StudentRegistration.countDocuments({ ...baseStudentQuery, educationLevel: 'O/L' }).maxTimeMS(QUERY_TIMEOUT_MS),
      StudentRegistration.countDocuments({ ...baseStudentQuery, educationLevel: 'A/L' }).maxTimeMS(QUERY_TIMEOUT_MS),
      School.countDocuments({ status: 'ACTIVE' }).maxTimeMS(QUERY_TIMEOUT_MS),
      StudentRegistration.countDocuments({ ...baseStudentQuery, createdAt: { $gte: startOfTodayLocal } }).maxTimeMS(QUERY_TIMEOUT_MS),
      TeacherRegistration.countDocuments({ ...baseTeacherQuery, createdAt: { $gte: startOfTodayLocal } }).maxTimeMS(QUERY_TIMEOUT_MS)
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

    const results = await StudentRegistration.aggregate(pipeline).maxTimeMS(QUERY_TIMEOUT_MS);

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
 * Get School Statistics (Accurate Aggregation by School Name Snapshot)
 */
async function getSchoolStats(req, res, next) {
  try {
    const [studentGroup, teacherGroup] = await Promise.all([
      StudentRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$schoolNameSnapshot',
            totalStudents: { $sum: 1 },
            olStudents: {
              $sum: { $cond: [{ $eq: ['$educationLevel', 'O/L'] }, 1, 0] }
            },
            alStudents: {
              $sum: { $cond: [{ $eq: ['$educationLevel', 'A/L'] }, 1, 0] }
            }
          }
        }
      ]).maxTimeMS(QUERY_TIMEOUT_MS),
      TeacherRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$schoolNameSnapshot',
            totalTeachers: { $sum: 1 }
          }
        }
      ]).maxTimeMS(QUERY_TIMEOUT_MS)
    ]);

    const schoolMap = {};

    studentGroup.forEach(g => {
      if (g._id) {
        schoolMap[g._id] = {
          schoolName: g._id,
          totalVisitors: g.totalStudents,
          totalStudents: g.totalStudents,
          totalTeachers: 0,
          olStudents: g.olStudents,
          alStudents: g.alStudents
        };
      }
    });

    teacherGroup.forEach(g => {
      if (g._id) {
        if (schoolMap[g._id]) {
          schoolMap[g._id].totalTeachers = g.totalTeachers;
          schoolMap[g._id].totalVisitors += g.totalTeachers;
        } else {
          schoolMap[g._id] = {
            schoolName: g._id,
            totalVisitors: g.totalTeachers,
            totalStudents: 0,
            totalTeachers: g.totalTeachers,
            olStudents: 0,
            alStudents: 0
          };
        }
      }
    });

    const statsList = Object.values(schoolMap).sort((a, b) => b.totalVisitors - a.totalVisitors);

    return res.json({
      success: true,
      data: statsList
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
      ]).maxTimeMS(QUERY_TIMEOUT_MS),
      TeacherRegistration.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$registeredBy',
            operatorName: { $first: '$registeredByName' },
            teachers: { $sum: 1 }
          }
        }
      ]).maxTimeMS(QUERY_TIMEOUT_MS)
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
    ]).maxTimeMS(QUERY_TIMEOUT_MS);

    const teacherHourly = await TeacherRegistration.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: { $hour: { date: '$createdAt', timezone: TIMEZONE } },
          count: { $sum: 1 }
        }
      }
    ]).maxTimeMS(QUERY_TIMEOUT_MS);

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
