import { describe, it, expect } from 'vitest'
import { formatDate } from '../formatDate'

describe('formatDate', () => {
  it('formats valid ISO dates', () => {
    const result = formatDate('2023-10-15T12:00:00Z')
    expect(result).toMatch(/octubre/i)
    expect(result).toMatch(/2023/)
  })

  it('handles null, undefined or empty gracefully', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('handles invalid date strings gracefully', () => {
    expect(formatDate('not-a-date')).toBe('Fecha inválida')
  })
})
