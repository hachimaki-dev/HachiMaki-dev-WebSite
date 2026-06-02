import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'

// Simple User Agent parser
function parseUserAgent(ua) {
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
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS'
  } else if (/linux/i.test(ua)) {
    os = 'Linux'
  } else if (/android/i.test(ua)) {
    os = 'Android'
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS'
  }

  return { browser, os, deviceType }
}

const MAX_LOGS_PER_SESSION = 50

export function useVisitorTracker() {
  const location = useLocation()
  const geoDataRef = useRef(null)
  const isInitializedRef = useRef(false)

  // Get or create Session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('hachimaki_visitor_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('hachimaki_visitor_session', sessionId)
    }
    return sessionId
  }

  // Get current log count
  const getLogCount = () => parseInt(sessionStorage.getItem('hachimaki_visitor_log_count') || '0', 10)
  
  // Increment log count
  const incrementLogCount = () => {
    const count = getLogCount() + 1
    sessionStorage.setItem('hachimaki_visitor_log_count', count.toString())
    return count
  }

  // Log action to Supabase
  const logAction = async (actionType, actionDetails = {}) => {
    const count = getLogCount()
    if (count >= MAX_LOGS_PER_SESSION) {
      return
    }

    try {
      incrementLogCount()
      const sessionId = getSessionId()
      const geo = geoDataRef.current || {}
      const ua = navigator.userAgent
      const { browser, os, deviceType } = parseUserAgent(ua)
      
      const screenResolution = `${window.screen.width}x${window.screen.height}`
      const referrer = document.referrer || 'Direct'

      // Gather battery level if supported
      let batteryInfo = {}
      try {
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery()
          batteryInfo = {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          }
        }
      } catch (err) {
        // Battery API blocked or unsupported
      }

      // Connection speed info
      const connectionInfo = navigator.connection ? {
        downlink: navigator.connection.downlink,
        effectiveType: navigator.connection.effectiveType
      } : {}

      const payload = {
        session_id: sessionId,
        ip: geo.ip || 'Unknown',
        country: geo.country_name || 'Unknown',
        city: geo.city || 'Unknown',
        isp: geo.org || 'Unknown',
        browser,
        os,
        device_type: deviceType,
        screen_resolution: screenResolution,
        referrer,
        page_path: location.pathname,
        action_type: actionType,
        action_details: {
          ...actionDetails,
          hardware: {
            cores: navigator.hardwareConcurrency || null,
            memory: navigator.deviceMemory || null,
            language: navigator.language || null
          },
          battery: batteryInfo,
          connection: connectionInfo
        }
      }

      await supabase.from(TABLES.VISITOR_LOGS).insert([payload])
    } catch (error) {
      // Fail silently to avoid interrupting the visitor session
    }
  }

  // Initialize geo data and session start
  useEffect(() => {
    const initTracker = async () => {
      if (isInitializedRef.current) return
      isInitializedRef.current = true

      try {
        // Try ipapi.co (HTTPS-friendly)
        const response = await fetch('https://ipapi.co/json/')
        if (response.ok) {
          geoDataRef.current = await response.json()
        }
      } catch (err) {
        // Fallback: ip-api (might fail on HTTPS, but good to try as fallback)
        try {
          const res = await fetch('https://ipapi.co/json/') // fallback to backup fetch
          if (res.ok) {
            geoDataRef.current = await res.json()
          }
        } catch (e) {
          // Both failed (probably offline or adblocker)
        }
      }

      // Log initial session start
      await logAction('session_start', {
        type: 'initial_load'
      })
    }

    initTracker()

    // Global click listener for interactive elements
    const handleGlobalClick = (e) => {
      const target = e.target.closest('a, button, input, select, textarea, [role="button"], .clickable, .btn, .card, .project-card, .blog-card')
      if (!target) return

      let label = target.innerText?.trim() || target.placeholder || target.ariaLabel || target.name || target.id || target.tagName
      if (label.length > 50) label = label.substring(0, 47) + '...'

      logAction('click', {
        element: target.tagName.toLowerCase(),
        label: label,
        id: target.id || null,
        className: target.className || null,
        clientX: e.clientX,
        clientY: e.clientY
      })
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => {
      document.removeEventListener('click', handleGlobalClick, true)
    }
  }, [])

  // Log page views when route changes
  const isFirstPageLoad = useRef(true)
  useEffect(() => {
    if (isFirstPageLoad.current) {
      isFirstPageLoad.current = false
      return // Already handled by session_start log
    }

    logAction('page_view', {
      title: document.title
    })
  }, [location.pathname])
}
