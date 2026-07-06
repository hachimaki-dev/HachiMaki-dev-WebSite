import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify'

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world')
  })

  it('removes accents/diacritics', () => {
    expect(slugify('canción de pingüino')).toBe('cancion-de-pinguino')
  })

  it('removes non-alphanumeric characters', () => {
    expect(slugify('hello @#$ world!')).toBe('hello-world')
  })

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('hello   world---test')).toBe('hello-world-test')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify(' -hello-world- ')).toBe('hello-world')
  })
})
