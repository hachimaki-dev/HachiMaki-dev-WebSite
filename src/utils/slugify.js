/**
 * slugify — Convert a string to a URL-safe slug
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')    // Remove non-alphanumeric
    .replace(/[\s_]+/g, '-')          // Spaces/underscores to hyphens
    .replace(/-+/g, '-')              // Collapse multiple hyphens
    .replace(/^-|-$/g, '')            // Trim leading/trailing hyphens
}
