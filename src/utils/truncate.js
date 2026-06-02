/**
 * truncate — Truncate text to a maximum length
 * @param {string} text
 * @param {number} [maxLength=160]
 * @param {string} [suffix='…']
 * @returns {string}
 */
export function truncate(text, maxLength = 160, suffix = '…') {
  if (!text) return ''
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + suffix
}
