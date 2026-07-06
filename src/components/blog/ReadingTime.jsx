/**
 * ReadingTime — Display estimated reading time
 * @param {{ minutes: number }} props
 */
export function ReadingTime({ minutes }) {
  if (!minutes || minutes < 1) return null

  return (
    <span className="reading-time">
      {minutes} min de lectura
    </span>
  )
}

/**
 * Calculate reading time from text content
 * @param {string} text - Raw text or markdown content
 * @returns {number} Estimated minutes
 */
export function calculateReadingTime(text) {
  if (!text) return 0
  // Strip markdown/html syntax for accurate word count
  const clean = text
    .replace(/```[\s\S]*?```/g, '')   // Remove code blocks
    .replace(/`[^`]*`/g, '')          // Remove inline code
    .replace(/<[^>]+>/g, '')          // Remove HTML tags
    .replace(/[#*_~\[\]()>|\\-]/g, '') // Remove markdown syntax
    .trim()
  const words = clean.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
