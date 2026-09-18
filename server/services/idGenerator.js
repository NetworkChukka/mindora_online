const Counter = require('../models/Counter');

/**
 * Concurrency-safe, atomic registration ID generator.
 * Format: MIN-000001, TCH-000001
 */
async function generateRegistrationId(counterId, prefix = 'MIN', padLength = 6) {
  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqStr = String(counter.seq).padStart(padLength, '0');
  return `${prefix}-${seqStr}`;
}

module.exports = {
  generateRegistrationId
};
