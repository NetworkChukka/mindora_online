const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const StudentRegistration = require('../models/StudentRegistration');
const TeacherRegistration = require('../models/TeacherRegistration');
const School = require('../models/School');

/**
 * Generate comprehensive Excel Workbook containing Visitors, Students, Teachers, and Summaries
 */
async function generateExcelReport(filter = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MINDORA Registration System';
  workbook.created = new Date();

  // 1. Fetch data
  const baseFilter = { deleted: false, ...filter };
  const students = await StudentRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();
  const teachers = await TeacherRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();

  // Combine visitors sorted by date
  const visitors = [
    ...students.map(s => ({
      regId: s.registrationNumber,
      type: 'Student',
      name: s.studentName,
      school: s.schoolNameSnapshot,
      grade: s.grade,
      level: s.educationLevel,
      phone: s.phoneNumber || 'N/A',
      by: s.registeredByName,
      date: new Date(s.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    })),
    ...teachers.map(t => ({
      regId: t.teacherRegistrationNumber,
      type: 'Teacher',
      name: t.teacherName,
      school: t.schoolNameSnapshot,
      grade: 'N/A',
      level: 'N/A',
      phone: t.phoneNumber || 'N/A',
      by: t.registeredByName,
      date: new Date(t.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- Sheet 1: ALL VISITORS ---
  const sheet1 = workbook.addWorksheet('All Visitors');
  sheet1.columns = [
    { header: 'Registration ID', key: 'regId', width: 18 },
    { header: 'Visitor Type', key: 'type', width: 14 },
    { header: 'Full Name', key: 'name', width: 28 },
    { header: 'School Name', key: 'school', width: 32 },
    { header: 'Grade', key: 'grade', width: 10 },
    { header: 'Education Level', key: 'level', width: 16 },
    { header: 'Phone Number', key: 'phone', width: 18 },
    { header: 'Registered By', key: 'by', width: 20 },
    { header: 'Date & Time (Asia/Colombo)', key: 'date', width: 24 }
  ];
  sheet1.addRows(visitors);
  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  // --- Sheet 2: STUDENTS ---
  const sheet2 = workbook.addWorksheet('Students');
  sheet2.columns = [
    { header: 'Reg ID', key: 'registrationNumber', width: 16 },
    { header: 'Student Name', key: 'studentName', width: 28 },
    { header: 'School', key: 'schoolNameSnapshot', width: 32 },
    { header: 'Grade', key: 'grade', width: 10 },
    { header: 'Level', key: 'educationLevel', width: 12 },
    { header: 'Phone', key: 'phoneNumber', width: 16 },
    { header: 'Registered By', key: 'registeredByName', width: 18 },
    { header: 'Registration Time', key: 'createdAt', width: 22 }
  ];
  sheet2.addRows(students.map(s => ({
    ...s,
    phoneNumber: s.phoneNumber || 'N/A',
    createdAt: new Date(s.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
  })));
  sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };

  // --- Sheet 3: TEACHERS ---
  const sheet3 = workbook.addWorksheet('Teachers');
  sheet3.columns = [
    { header: 'Teacher Reg ID', key: 'teacherRegistrationNumber', width: 18 },
    { header: 'Teacher Name', key: 'teacherName', width: 28 },
    { header: 'School', key: 'schoolNameSnapshot', width: 32 },
    { header: 'Phone', key: 'phoneNumber', width: 16 },
    { header: 'Registered By', key: 'registeredByName', width: 18 },
    { header: 'Registration Time', key: 'createdAt', width: 22 }
  ];
  sheet3.addRows(teachers.map(t => ({
    ...t,
    phoneNumber: t.phoneNumber || 'N/A',
    createdAt: new Date(t.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
  })));
  sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };

  // --- Sheet 4: SUMMARY & STATS ---
  const sheet4 = workbook.addWorksheet('Summary & Statistics');
  const olCount = students.filter(s => s.educationLevel === 'O/L').length;
  const alCount = students.filter(s => s.educationLevel === 'A/L').length;
  
  sheet4.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Count', key: 'count', width: 15 }
  ];
  sheet4.addRows([
    { metric: 'Total Visitors', count: students.length + teachers.length },
    { metric: 'Total Students', count: students.length },
    { metric: 'Total Teachers', count: teachers.length },
    { metric: 'O/L Students (Grades 6-11)', count: olCount },
    { metric: 'A/L Students (Grades 12-13)', count: alCount }
  ]);
  sheet4.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  return workbook.xlsx.writeBuffer();
}

/**
 * Generate CSV output with UTF-8 BOM for Sinhala / Unicode compatibility
 */
async function generateCsvReport(type = 'all', filter = {}) {
  const baseFilter = { deleted: false, ...filter };
  let rows = [];

  if (type === 'students') {
    const students = await StudentRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();
    rows = students.map(s => ({
      'Registration ID': s.registrationNumber,
      'Type': 'Student',
      'Name': s.studentName,
      'School': s.schoolNameSnapshot,
      'Grade': s.grade,
      'Education Level': s.educationLevel,
      'Phone': s.phoneNumber || '',
      'Registered By': s.registeredByName,
      'Created At': new Date(s.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    }));
  } else if (type === 'teachers') {
    const teachers = await TeacherRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();
    rows = teachers.map(t => ({
      'Registration ID': t.teacherRegistrationNumber,
      'Type': 'Teacher',
      'Name': t.teacherName,
      'School': t.schoolNameSnapshot,
      'Grade': 'N/A',
      'Education Level': 'N/A',
      'Phone': t.phoneNumber || '',
      'Registered By': t.registeredByName,
      'Created At': new Date(t.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    }));
  } else {
    const students = await StudentRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();
    const teachers = await TeacherRegistration.find(baseFilter).sort({ createdAt: -1 }).lean();
    
    rows = [
      ...students.map(s => ({
        'Registration ID': s.registrationNumber,
        'Type': 'Student',
        'Name': s.studentName,
        'School': s.schoolNameSnapshot,
        'Grade': s.grade,
        'Education Level': s.educationLevel,
        'Phone': s.phoneNumber || '',
        'Registered By': s.registeredByName,
        'Created At': new Date(s.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
      })),
      ...teachers.map(t => ({
        'Registration ID': t.teacherRegistrationNumber,
        'Type': 'Teacher',
        'Name': t.teacherName,
        'School': t.schoolNameSnapshot,
        'Grade': 'N/A',
        'Education Level': 'N/A',
        'Phone': t.phoneNumber || '',
        'Registered By': t.registeredByName,
        'Created At': new Date(t.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
      }))
    ];
  }

  if (rows.length === 0) {
    return '\uFEFFRegistration ID,Type,Name,School,Grade,Education Level,Phone,Registered By,Created At\n';
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];

  for (const r of rows) {
    const values = headers.map(h => {
      const val = String(r[h] || '').replace(/"/g, '""');
      return `"${val}"`;
    });
    csvLines.push(values.join(','));
  }

  // Add UTF-8 BOM marker \uFEFF for proper Sinhala/Unicode rendering in Excel
  return '\uFEFF' + csvLines.join('\n');
}

/**
 * Generate PDF document stream for reports
 */
function generatePdfReport(res, title = 'MINDORA Exhibition Summary Report', filter = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="MINDORA_Report_${Date.now()}.pdf"`);
      doc.pipe(res);

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill('#0F172A');
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('MINDORA', 40, 20);
      doc.fontSize(12).font('Helvetica').text('MICROBIOLOGY EXHIBITION REGISTRATION REPORT', 40, 48);
      
      doc.fillColor('#333333').fontSize(14).font('Helvetica-Bold').text(title, 40, 100);
      doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`, 40, 120);

      // Data fetch
      const baseFilter = { deleted: false, ...filter };
      const studentCount = await StudentRegistration.countDocuments(baseFilter);
      const teacherCount = await TeacherRegistration.countDocuments(baseFilter);
      const olCount = await StudentRegistration.countDocuments({ ...baseFilter, educationLevel: 'O/L' });
      const alCount = await StudentRegistration.countDocuments({ ...baseFilter, educationLevel: 'A/L' });
      const totalSchools = await School.countDocuments({ status: 'ACTIVE' });

      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('EXHIBITION OVERVIEW STATISTICS:', 40, 150);

      const stats = [
        ['Total Visitors:', String(studentCount + teacherCount)],
        ['Total Students:', String(studentCount)],
        ['Total Teachers:', String(teacherCount)],
        ['O/L Students (Grades 6-11):', String(olCount)],
        ['A/L Students (Grades 12-13):', String(alCount)],
        ['Active Participating Schools:', String(totalSchools)]
      ];

      let yPos = 175;
      stats.forEach(([label, val]) => {
        doc.fontSize(10).font('Helvetica').text(label, 50, yPos);
        doc.font('Helvetica-Bold').text(val, 260, yPos);
        yPos += 20;
      });

      // Recent Registrations Preview Table
      doc.moveDown();
      yPos += 20;
      doc.fontSize(12).font('Helvetica-Bold').text('RECENT REGISTRATIONS PREVIEW:', 40, yPos);
      yPos += 20;

      doc.rect(40, yPos, 515, 20).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('ID', 45, yPos + 5);
      doc.text('Type', 110, yPos + 5);
      doc.text('Name', 170, yPos + 5);
      doc.text('School', 310, yPos + 5);
      doc.text('Grade/Level', 460, yPos + 5);

      yPos += 22;
      const recentStudents = await StudentRegistration.find(baseFilter).sort({ createdAt: -1 }).limit(15).lean();

      doc.fillColor('#333333').font('Helvetica');
      recentStudents.forEach((s) => {
        if (yPos > 750) {
          doc.addPage();
          yPos = 40;
        }
        doc.text(s.registrationNumber, 45, yPos);
        doc.text('Student', 110, yPos);
        doc.text(s.studentName.slice(0, 22), 170, yPos);
        doc.text(s.schoolNameSnapshot.slice(0, 25), 310, yPos);
        doc.text(`Gr ${s.grade} (${s.educationLevel})`, 460, yPos);
        yPos += 18;
      });

      // Footer
      doc.fontSize(8).fillColor('#888888').text('MINDORA Microbiology Exhibition System • Server-Generated Authentic Report', 40, 780, { align: 'center' });

      doc.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateExcelReport,
  generateCsvReport,
  generatePdfReport
};
