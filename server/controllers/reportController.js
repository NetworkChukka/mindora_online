const { generateExcelReport, generateCsvReport, generatePdfReport } = require('../services/reportService');
const { logAudit } = require('../services/auditService');

/**
 * Export Excel Workbook (All Visitors, Students, Teachers, Summary)
 */
async function exportExcel(req, res, next) {
  try {
    const { schoolId, grade, educationLevel, startDate, endDate } = req.query;

    const filter = {};
    if (schoolId) filter.schoolId = schoolId;
    if (grade) filter.grade = parseInt(grade);
    if (educationLevel) filter.educationLevel = educationLevel;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const buffer = await generateExcelReport(filter);

    await logAudit({
      user: req.user,
      action: 'ADMIN_EXPORTED_REPORT',
      description: 'Exported Excel full report',
      req
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="MINDORA_Report_${Date.now()}.xlsx"`);
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Export CSV Report
 */
async function exportCsv(req, res, next) {
  try {
    const { type = 'all', schoolId, grade, educationLevel } = req.query;

    const filter = {};
    if (schoolId) filter.schoolId = schoolId;
    if (grade) filter.grade = parseInt(grade);
    if (educationLevel) filter.educationLevel = educationLevel;

    const csvData = await generateCsvReport(type, filter);

    await logAudit({
      user: req.user,
      action: 'ADMIN_EXPORTED_REPORT',
      description: `Exported CSV report (${type})`,
      req
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="MINDORA_${type}_${Date.now()}.csv"`);
    return res.send(csvData);
  } catch (err) {
    next(err);
  }
}

/**
 * Export PDF Report
 */
async function exportPdf(req, res, next) {
  try {
    const { title = 'MINDORA Exhibition Summary Report', schoolId } = req.query;

    const filter = {};
    if (schoolId) filter.schoolId = schoolId;

    await logAudit({
      user: req.user,
      action: 'ADMIN_EXPORTED_REPORT',
      description: 'Exported PDF summary report',
      req
    });

    await generatePdfReport(res, title, filter);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  exportExcel,
  exportCsv,
  exportPdf
};
