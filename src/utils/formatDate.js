/**
 * formatDate — Format a date string for display
 * @param {string|Date} date
 * @param {object} [options]
 * @param {string} [options.locale='es-ES']
 * @param {boolean} [options.relative=false]
 * @returns {string}
 */
export function formatDate(date, { locale = 'es-ES', relative = false } = {}) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Fecha inválida'

  if (relative) {
    const now = new Date()
    const diff = now - d
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    if (days < 7) return `hace ${days}d`
  }

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
