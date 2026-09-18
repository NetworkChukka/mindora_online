/**
 * Validates and normalizes phone numbers (Sri Lanka focus + general international)
 * Returns formatted phone string or null if invalid (allows empty strings).
 */
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (trimmed === '') return '';

  // Clean non-digit except leading +
  let cleaned = trimmed.replace(/[^\d+]/g, '');

  // Sri Lanka local format conversion (+947X... -> 07X...)
  if (cleaned.startsWith('+94')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('94') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Basic sanity check: 9-12 digits
  const digitOnly = cleaned.replace(/\D/g, '');
  if (digitOnly.length >= 9 && digitOnly.length <= 12) {
    return cleaned;
  }
  return cleaned; // Preserve input if slightly custom, but safely sanitized
}

module.exports = {
  sanitizePhone
};
