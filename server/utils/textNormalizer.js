/**
 * Normalizes string for deduplication (case-insensitive, trims extra spaces)
 * Example: "  Anuradhapura   Central  College  " -> "anuradhapura central college"
 */
function normalizeName(str) {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

module.exports = {
  normalizeName
};
