const School = require('../models/School');
const { normalizeName } = require('../utils/textNormalizer');
const { logAudit } = require('../services/auditService');
const { broadcastSchoolCreated, broadcastSchoolUpdated } = require('../sockets/socketManager');

/**
 * Get / Search Schools (Server-side search with debounce support)
 */
async function getSchools(req, res, next) {
  try {
    const { search = '', status, page = 1, limit = 50, noCount = 'false', fields = '' } = req.query;

    const query = {};
    // Only filter by status if specific ACTIVE or DISABLED is requested (ignore 'ALL')
    if (status && status !== 'ALL') {
      query.status = status;
    } else if (!status) {
      query.status = 'ACTIVE';
    }

    if (search.trim()) {
      const searchNormalized = normalizeName(search);
      query.$or = [
        { schoolName: { $regex: search.trim(), $options: 'i' } },
        { normalizedName: { $regex: searchNormalized, $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
        { district: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build select projection from optional comma-separated fields param
    // e.g. fields=_id,schoolName,city,district reduces payload size significantly
    const projection = fields.trim()
      ? fields.trim().split(',').reduce((acc, f) => { acc[f.trim()] = 1; return acc; }, {})
      : {};

    // Skip expensive countDocuments for dropdown/autocomplete requests
    const skipCount = noCount === 'true';
    const [schools, total] = await Promise.all([
      School.find(query, projection).sort({ schoolName: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      skipCount ? Promise.resolve(0) : School.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: schools,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: skipCount ? 1 : Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create New School (with Duplicate Protection & Real-Time Sync)
 */
async function createSchool(req, res, next) {
  try {
    const { schoolName, schoolCode = '', city = '', district = '' } = req.body;

    if (!schoolName || !schoolName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'School Name is required.'
      });
    }

    const normalized = normalizeName(schoolName);

    // Check if normalized school already exists
    const existing = await School.findOne({ normalizedName: normalized });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'School already exists in central database.',
        duplicate: true,
        school: existing
      });
    }

    try {
      const school = await School.create({
        schoolName: schoolName.trim(),
        normalizedName: normalized,
        schoolCode: schoolCode.trim(),
        city: city.trim(),
        district: district.trim(),
        createdBy: req.user._id,
        createdByName: req.user.fullName || req.user.username
      });

      logAudit({
        user: req.user,
        action: 'OPERATOR_CREATED_SCHOOL',
        entityType: 'SCHOOL',
        entityId: school._id.toString(),
        description: `Created school "${school.schoolName}" (${school.city})`,
        req
      }).catch(() => {});

      // Broadcast real-time school:created event to all connected clients
      broadcastSchoolCreated(school);

      return res.status(201).json({
        success: true,
        message: 'School created successfully.',
        data: school
      });
    } catch (createErr) {
      // Handle MongoDB E11000 duplicate key race condition
      if (createErr.code === 11000) {
        const raceExisting = await School.findOne({ normalizedName: normalized });
        return res.status(409).json({
          success: false,
          message: 'School already exists in central database.',
          duplicate: true,
          school: raceExisting
        });
      }
      throw createErr;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Update School
 */
async function updateSchool(req, res, next) {
  try {
    const { id } = req.params;
    const { schoolName, schoolCode, city, district, status } = req.body;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found.'
      });
    }

    if (schoolName && schoolName.trim()) {
      school.schoolName = schoolName.trim();
      school.normalizedName = normalizeName(schoolName);
    }
    if (schoolCode !== undefined) school.schoolCode = schoolCode.trim();
    if (city !== undefined) school.city = city.trim();
    if (district !== undefined) school.district = district.trim();
    if (status !== undefined) school.status = status;

    await school.save();

    logAudit({
      user: req.user,
      action: 'ADMIN_EDITED_SCHOOL',
      entityType: 'SCHOOL',
      entityId: school._id.toString(),
      description: `Updated school "${school.schoolName}"`,
      req
    }).catch(() => {});

    broadcastSchoolUpdated(school);

    return res.json({
      success: true,
      message: 'School updated successfully.',
      data: school
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Soft Disable School
 */
async function disableSchool(req, res, next) {
  try {
    const { id } = req.params;
    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found.'
      });
    }

    school.status = school.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await school.save();

    logAudit({
      user: req.user,
      action: 'ADMIN_TOGGLED_SCHOOL_STATUS',
      entityType: 'SCHOOL',
      entityId: school._id.toString(),
      description: `School "${school.schoolName}" status changed to ${school.status}`,
      req
    }).catch(() => {});

    broadcastSchoolUpdated(school);

    return res.json({
      success: true,
      message: `School status updated to ${school.status}.`,
      data: school
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Bulk Import Schools (JSON Array from CSV/Excel)
 */
async function importSchools(req, res, next) {
  try {
    const { schools = [] } = req.body;

    if (!Array.isArray(schools) || schools.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No school records supplied for import.'
      });
    }

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    let errors = 0;

    for (const item of schools) {
      const name = item.schoolName || item.name || item['School Name'];
      if (!name || !name.trim()) {
        errors++;
        continue;
      }

      const normalized = normalizeName(name);
      const existing = await School.findOne({ normalizedName: normalized });

      if (existing) {
        duplicates++;
        skipped++;
        continue;
      }

      try {
        await School.create({
          schoolName: name.trim(),
          normalizedName: normalized,
          schoolCode: (item.schoolCode || item.code || item['School Code'] || '').toString().trim(),
          city: (item.city || item['City'] || '').toString().trim(),
          district: (item.district || item['District'] || '').toString().trim(),
          createdBy: req.user._id,
          createdByName: req.user.fullName || req.user.username
        });
        imported++;
      } catch (err) {
        if (err.code === 11000) {
          duplicates++;
          skipped++;
        } else {
          errors++;
        }
      }
    }

    logAudit({
      user: req.user,
      action: 'ADMIN_IMPORTED_SCHOOLS',
      entityType: 'SCHOOL',
      description: `Bulk imported schools summary: ${imported} imported, ${skipped} skipped (${duplicates} duplicates), ${errors} errors`,
      req
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'School import completed.',
      summary: {
        total: schools.length,
        imported,
        skipped,
        duplicates,
        errors
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSchools,
  createSchool,
  updateSchool,
  disableSchool,
  importSchools
};
