/**
 * parseUserAgent — Parse a User Agent string to extract browser, OS, and device type.
 *
 * Shared utility used by useVisitorTracker (logging) and VisitantesPage (display).
 *
 * @param {string} ua - The User Agent string (navigator.userAgent)
 * @returns {{ browser: string, os: string, deviceType: string }}
 */
export function parseUserAgent(ua) {
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'
  let deviceType = 'Desktop'

  if (/mobi|android|iphone|ipad/i.test(ua)) {
    deviceType = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile'
  }

  if (/chrome|crios/i.test(ua) && !/edge|edg|opr/i.test(ua)) {
    browser = 'Chrome'
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Safari'
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox'
  } else if (/opr|opera/i.test(ua)) {
    browser = 'Opera'
  } else if (/edg|edge/i.test(ua)) {
    browser = 'Edge'
  }

  if (/windows/i.test(ua)) {
    os = 'Windows'
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS'
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS'
  } else if (/android/i.test(ua)) {
    os = 'Android'
  } else if (/linux/i.test(ua)) {
    os = 'Linux'
  }

  return { browser, os, deviceType }
}
