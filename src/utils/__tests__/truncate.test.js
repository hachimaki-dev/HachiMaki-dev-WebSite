import { describe, it, expect } from 'vitest'
import { truncate } from '../truncate'

describe('truncate', () => {
  it('does not truncate strings shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates strings longer than limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('handles null and undefined', () => {
    expect(truncate(null, 5)).toBe('')
    expect(truncate(undefined, 5)).toBe('')
  })
})
