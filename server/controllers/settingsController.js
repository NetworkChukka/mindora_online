const Settings = require('../models/Settings');
const { logAudit } = require('../services/auditService');

/**
 * Get System Settings
 */
async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update System Settings (Admin only)
 */
async function updateSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      eventName,
      subtitle,
      eventDate,
      venue,
      studentPrefix,
      teacherPrefix,
      duplicateDetection,
      eventDayMode
    } = req.body;

    if (eventName) settings.eventName = eventName.trim();
    if (subtitle) settings.subtitle = subtitle.trim();
    if (eventDate) settings.eventDate = eventDate.trim();
    if (venue) settings.venue = venue.trim();
    if (studentPrefix) settings.studentPrefix = studentPrefix.trim();
    if (teacherPrefix) settings.teacherPrefix = teacherPrefix.trim();
    if (duplicateDetection !== undefined) settings.duplicateDetection = duplicateDetection;
    if (eventDayMode !== undefined) settings.eventDayMode = eventDayMode;

    await settings.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_UPDATED_SETTINGS',
      entityType: 'SETTINGS',
      entityId: settings._id.toString(),
      description: 'Updated system event settings',
      req
    });

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: settings
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
