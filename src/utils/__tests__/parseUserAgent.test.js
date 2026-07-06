import { describe, it, expect } from 'vitest'
import { parseUserAgent } from '../parseUserAgent'

describe('parseUserAgent', () => {
  it('parses Chrome on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(parseUserAgent(ua)).toEqual({
      browser: 'Chrome',
      os: 'Windows',
      deviceType: 'Desktop'
    })
  })

  it('parses Safari on iOS Mobile', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    expect(parseUserAgent(ua)).toEqual({
      browser: 'Safari',
      os: 'iOS',
      deviceType: 'Mobile'
    })
  })

  it('parses Edge on macOS', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    expect(parseUserAgent(ua)).toEqual({
      browser: 'Edge',
      os: 'macOS',
      deviceType: 'Desktop'
    })
  })
})
