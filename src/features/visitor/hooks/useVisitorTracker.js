import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { parseUserAgent } from '../../../utils/parseUserAgent'

const MAX_LOGS_PER_SESSION = 50

// djb2 simple hash
const hashString = (str) => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
  }
  return (hash >>> 0).toString(16) // unsigned 32 bit hex
}

const generateCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'NoCanvas'
    canvas.width = 200
    canvas.height = 50
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText("HachiMaki,Visitor,Tracker", 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText("HachiMaki,Visitor,Tracker", 4, 17)
    return hashString(canvas.toDataURL())
  } catch (e) {
    return 'ErrorCanvas'
  }
}

const getGPUModel = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'NoWebGL'
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'UnknownGPU'
  } catch (e) {
    return 'ErrorWebGL'
  }
}

export function useVisitorTracker() {
  const location = useLocation()
  const geoDataRef = useRef(null)
  const isInitializedRef = useRef(false)

  // Get or create Visitor Identity
  const getIdentity = () => {
    let visitorId = localStorage.getItem('hachimaki_visitor_id')
    let visitCount = parseInt(localStorage.getItem('hachimaki_visitor_count') || '0', 10)
    let lastVisitDate = localStorage.getItem('hachimaki_last_visit')

    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
      localStorage.setItem('hachimaki_visitor_id', visitorId)
    }

    let sessionId = sessionStorage.getItem('hachimaki_visitor_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('hachimaki_visitor_session', sessionId)
      
      // Es una nueva sesión, incrementamos contador
      visitCount += 1
      localStorage.setItem('hachimaki_visitor_count', visitCount.toString())
      lastVisitDate = new Date().toISOString()
      localStorage.setItem('hachimaki_last_visit', lastVisitDate)
    }

    const canvasFingerprint = localStorage.getItem('hachimaki_canvas_hash') || generateCanvasFingerprint()
    localStorage.setItem('hachimaki_canvas_hash', canvasFingerprint) // Cache for performance
    
    const gpuModel = localStorage.getItem('hachimaki_gpu_model') || getGPUModel()
    localStorage.setItem('hachimaki_gpu_model', gpuModel) // Cache for performance

    return { visitorId, sessionId, visitCount, lastVisitDate, canvasFingerprint, gpuModel }
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
      const { visitorId, sessionId, visitCount, lastVisitDate, canvasFingerprint, gpuModel } = getIdentity()
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
        visitor_id: visitorId,
        canvas_fingerprint: canvasFingerprint,
        gpu_model: gpuModel,
        visit_count: visitCount,
        last_visit_date: lastVisitDate,
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

  return {
    visitorId: getIdentity().visitorId,
    isLoading: false
  }
}
