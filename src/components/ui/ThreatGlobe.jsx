import { useState, useEffect, useRef } from 'react'
import { useVisitorLogs } from '../../features/visitor/hooks/useVisitorLogs'
import { parseUserAgent } from '../../utils/parseUserAgent'
import Icon from './Icon'
import './ThreatGlobe.css'

// Coordinate mappings for popular countries/continents
const COUNTRY_COORDS = {
  'Chile': { lat: -33.4489, lon: -70.6693 },
  'Argentina': { lat: -34.6037, lon: -58.3816 },
  'Spain': { lat: 40.4168, lon: -3.7038 },
  'España': { lat: 40.4168, lon: -3.7038 },
  'United States': { lat: 37.0902, lon: -95.7129 },
  'USA': { lat: 37.0902, lon: -95.7129 },
  'Mexico': { lat: 23.6345, lon: -102.5528 },
  'México': { lat: 23.6345, lon: -102.5528 },
  'Colombia': { lat: 4.5709, lon: -74.2973 },
  'Peru': { lat: -9.1900, lon: -75.0152 },
  'Perú': { lat: -9.1900, lon: -75.0152 },
  'Brazil': { lat: -14.2350, lon: -51.9253 },
  'Brasil': { lat: -14.2350, lon: -51.9253 },
  'Venezuela': { lat: 6.4238, lon: -66.5897 },
  'Ecuador': { lat: -1.8312, lon: -78.1834 },
  'Uruguay': { lat: -32.5228, lon: -55.7658 },
  'Bolivia': { lat: -16.2902, lon: -63.5887 },
  'Canada': { lat: 56.1304, lon: -106.3468 },
  'United Kingdom': { lat: 55.3781, lon: -3.4360 },
  'Germany': { lat: 51.1657, lon: 10.4515 },
  'France': { lat: 46.2276, lon: 2.2137 },
  'Italy': { lat: 41.8719, lon: 12.5674 },
  'Japan': { lat: 36.2048, lon: 138.2529 },
}

function getCoordsForLocation(country, city, coords) {
  if (coords && coords.lat && coords.lon) {
    return { lat: parseFloat(coords.lat), lon: parseFloat(coords.lon) }
  }
  const cleanCountry = (country || '').trim()
  if (COUNTRY_COORDS[cleanCountry]) {
    const base = COUNTRY_COORDS[cleanCountry]
    const hash = (city || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const latOffset = ((hash % 10) - 5) * 0.4
    const lonOffset = (((hash >> 2) % 10) - 5) * 0.4
    return { lat: base.lat + latOffset, lon: base.lon + lonOffset }
  }

  const hashStr = `${country || ''}-${city || ''}`
  let hash = 0
  for (let i = 0; i < hashStr.length; i++) {
    hash = hashStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const lat = ((Math.abs(hash) % 100) - 50)
  const lon = ((Math.abs(hash >> 3) % 360) - 180)
  return { lat, lon }
}

const CONTINENT_POLYS = [
  [[50, -100], [60, -120], [70, -160], [75, -80], [60, -60], [45, -60], [25, -80], [15, -90], [20, -100], [30, -110], [40, -120], [50, -100]],
  [[10, -75], [10, -50], [-5, -35], [-20, -40], [-40, -60], [-55, -70], [-35, -70], [-20, -80], [10, -75]],
  [[75, 10], [70, 60], [70, 120], [60, 160], [40, 140], [35, 120], [20, 100], [10, 80], [25, 45], [15, 40], [30, 30], [40, 0], [75, 10]],
  [[35, 15], [30, 32], [10, 45], [-15, 40], [-35, 20], [-30, 15], [-10, 10], [5, 10], [5, -10], [15, -15], [35, 15]],
  [[-15, 120], [-15, 145], [-35, 150], [-35, 115], [-15, 120]],
  [[70, -40], [80, -60], [85, -40], [75, -20], [70, -40]]
];

export function ThreatGlobe({ logs: passedLogs, isSidebar = false }) {
  const localLogsState = useVisitorLogs()
  const logs = passedLogs || localLogsState.logs

  const canvasRef = useRef(null)
  const [hoveredTarget, setHoveredTarget] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const [clientData, setClientData] = useState({
    ip: 'Escaneando...',
    country: 'Localizando...',
    city: 'Triangulando...',
    browser: 'Escaneando...',
    os: 'Escaneando...',
    battery: 'Midiendo...',
    canvasFingerprint: 'Calculando...',
    gpu: 'Escaneando...',
    visitorId: 'Calculando...',
  })

  const baseNode = { lat: -33.4489, lon: -70.6693 }
  const angleRef = useRef({ alpha: 0, targetAlpha: 0, autoRotate: true })

  // Dynamically select canvas dimensions
  const canvasWidth = isSidebar ? 280 : 360
  const canvasHeight = isSidebar ? 220 : 260

  useEffect(() => {
    const fetchStats = async () => {
      const ua = navigator.userAgent
      const { browser, os } = parseUserAgent(ua)

      let batteryText = 'No disp.'
      try {
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery()
          batteryText = `${Math.round(battery.level * 100)}%`
        }
      } catch (e) { }

      const canvasFingerprint = localStorage.getItem('hachimaki_canvas_hash') || '00000000'
      const gpu = localStorage.getItem('hachimaki_gpu_model') || 'Software Renderer'
      const visitorId = localStorage.getItem('hachimaki_visitor_id') || 'Unknown'

      setClientData(prev => ({
        ...prev,
        browser,
        os,
        battery: batteryText,
        canvasFingerprint,
        gpu,
        visitorId,
      }))

      try {
        const response = await fetch('https://ipapi.co/json/')
        if (response.ok) {
          const data = await response.json()
          setClientData(prev => ({
            ...prev,
            ip: data.ip || 'Oculto',
            country: data.country_name || 'Desconocido',
            city: data.city || 'Desconocido',
          }))
        }
      } catch (e) { }
    }

    fetchStats()
  }, [])

  const continentPointsRef = useRef([])
  useEffect(() => {
    const points = []
    CONTINENT_POLYS.forEach(poly => {
      for (let i = 0; i < poly.length - 1; i++) {
        const [lat1, lon1] = poly[i]
        const [lat2, lon2] = poly[i + 1]
        const dist = Math.hypot(lat2 - lat1, lon2 - lon1)
        const steps = Math.max(4, Math.floor(dist / 1.5))
        for (let s = 0; s < steps; s++) {
          const t = s / steps
          points.push({
            lat: lat1 + (lat2 - lat1) * t,
            lon: lon1 + (lon2 - lon1) * t
          })
        }
      }
    })
    continentPointsRef.current = points
  }, [canvasWidth])

  const visitorNodes = (() => {
    const unique = {}
    logs.forEach(log => {
      const sid = log.visitor_id || log.session_id
      if (!sid) return
      if (!unique[sid] || (log.city && !unique[sid].city)) {
        const coords = getCoordsForLocation(log.country, log.city, log.action_details?.coords)
        const isCurrent = sid === clientData.visitorId

        unique[sid] = {
          id: sid,
          ip: log.ip || 'Oculto',
          city: log.city || 'Desconocido',
          country: log.country || 'Desconocido',
          browser: log.browser || 'Desconocido',
          os: log.os || 'Desconocido',
          gpu: log.gpu_model || 'Desconocido',
          canvasFingerprint: log.canvas_fingerprint,
          action: log.action_type || 'Visita',
          page: log.page_path || '/',
          lat: coords.lat,
          lon: coords.lon,
          isCurrent
        }
      }
    })
    return Object.values(unique)
  })()

  // Location history aggregation
  const locationHistory = (() => {
    const counts = {}
    logs.forEach(log => {
      if (!log.country) return
      const city = log.city || 'Desconocido'
      const country = log.country
      const key = `${city}, ${country}`
      if (!counts[key]) {
        counts[key] = { city, country, count: 0 }
      }
      counts[key].count++
    })
    return Object.values(counts).sort((a, b) => b.count - a.count)
  })()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const R = Math.min(canvas.width, canvas.height) * 0.36
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    const render = () => {
      ctx.fillStyle = '#0c0c10'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Matrix scanline grid (very subtle)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.03)'
      ctx.lineWidth = 0.5
      const gridSize = 15
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      let alpha = angleRef.current.alpha
      alpha += 0.004
      angleRef.current.alpha = alpha

      // Sphere outline
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Latitudes
      const latSlices = [-60, -30, 0, 30, 60]
      latSlices.forEach(lat => {
        const theta = lat * Math.PI / 180
        const yVal = R * Math.sin(theta)
        const rad = R * Math.cos(theta)

        ctx.beginPath()
        let isFirst = true
        for (let lonDeg = -180; lonDeg <= 180; lonDeg += 6) {
          const phi = lonDeg * Math.PI / 180
          const xVal = rad * Math.sin(phi)
          const zVal = rad * Math.cos(phi)

          const xRot = xVal * Math.cos(alpha) - zVal * Math.sin(alpha)
          const zRot = xVal * Math.sin(alpha) + zVal * Math.cos(alpha)

          if (isFirst) {
            ctx.moveTo(cx + xRot, cy - yVal)
            isFirst = false
          } else {
            ctx.strokeStyle = zRot > 0 ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.03)'
            ctx.lineWidth = 0.5
            ctx.lineTo(cx + xRot, cy - yVal)
          }
        }
        ctx.stroke()
      })

      // Longitudes
      const lonSlices = [-120, -60, 0, 60, 120, 180]
      lonSlices.forEach(lonDeg => {
        ctx.beginPath()
        let isFirst = true
        for (let latDeg = -90; latDeg <= 90; latDeg += 6) {
          const theta = latDeg * Math.PI / 180
          const phi = lonDeg * Math.PI / 180

          const xVal = R * Math.cos(theta) * Math.sin(phi)
          const yVal = R * Math.sin(theta)
          const zVal = R * Math.cos(theta) * Math.cos(phi)

          const xRot = xVal * Math.cos(alpha) - zVal * Math.sin(alpha)
          const zRot = xVal * Math.sin(alpha) + zVal * Math.cos(alpha)

          if (isFirst) {
            ctx.moveTo(cx + xRot, cy - yVal)
            isFirst = false
          } else {
            ctx.strokeStyle = zRot > 0 ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.03)'
            ctx.lineWidth = 0.5
            ctx.lineTo(cx + xRot, cy - yVal)
          }
        }
        ctx.stroke()
      })

      // Continents
      continentPointsRef.current.forEach(pt => {
        const theta = pt.lat * Math.PI / 180
        const phi = pt.lon * Math.PI / 180

        const x = R * Math.cos(theta) * Math.sin(phi)
        const y = R * Math.sin(theta)
        const z = R * Math.cos(theta) * Math.cos(phi)

        const xRot = x * Math.cos(alpha) - z * Math.sin(alpha)
        const zRot = x * Math.sin(alpha) + z * Math.cos(alpha)

        if (zRot > 0) {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.45)'
          ctx.fillRect(cx + xRot - 0.7, cy - y - 0.7, 1.4, 1.4)
        }
      })

      // Central Base Node (Santiago, Chile)
      const baseTheta = baseNode.lat * Math.PI / 180
      const basePhi = baseNode.lon * Math.PI / 180
      const baseX = R * Math.cos(baseTheta) * Math.sin(basePhi)
      const baseY = R * Math.sin(baseTheta)
      const baseZ = R * Math.cos(baseTheta) * Math.cos(basePhi)
      const baseXRot = baseX * Math.cos(alpha) - baseZ * Math.sin(alpha)
      const baseZRot = baseX * Math.sin(alpha) + baseZ * Math.cos(alpha)
      const baseScreenX = cx + baseXRot
      const baseScreenY = cy - baseY

      if (baseZRot > 0) {
        ctx.fillStyle = '#8b5cf6'
        ctx.beginPath()
        ctx.arc(baseScreenX, baseScreenY, 3, 0, 2 * Math.PI)
        ctx.fill()
      }

      // Visitor Nodes & Threat Vectors
      visitorNodes.forEach(node => {
        const theta = node.lat * Math.PI / 180
        const phi = node.lon * Math.PI / 180

        const x = R * Math.cos(theta) * Math.sin(phi)
        const y = R * Math.sin(theta)
        const z = R * Math.cos(theta) * Math.cos(phi)

        const xRot = x * Math.cos(alpha) - z * Math.sin(alpha)
        const zRot = x * Math.sin(alpha) + z * Math.cos(alpha)

        const sx = cx + xRot
        const sy = cy - y

        // Draw connection arc
        ctx.beginPath()
        const steps = 10
        let lineDrawn = false
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const interLat = baseNode.lat + (node.lat - baseNode.lat) * t
          const interLon = baseNode.lon + (node.lon - baseNode.lon) * t

          const iTheta = interLat * Math.PI / 180
          const iPhi = interLon * Math.PI / 180

          const ix = R * Math.cos(iTheta) * Math.sin(iPhi)
          const iy = R * Math.sin(iTheta)
          const iz = R * Math.cos(iTheta) * Math.cos(iPhi)

          const ixRot = ix * Math.cos(alpha) - iz * Math.sin(alpha)
          const izRot = ix * Math.sin(alpha) + iz * Math.cos(alpha)

          if (i === 0) {
            ctx.moveTo(cx + ixRot, cy - iy)
          } else {
            ctx.lineTo(cx + ixRot, cy - iy)
          }
          if (izRot > 0) lineDrawn = true
        }

        ctx.strokeStyle = node.isCurrent ? 'rgba(224, 64, 64, 0.35)' : 'rgba(245, 158, 11, 0.2)'
        ctx.lineWidth = 0.6
        if (lineDrawn) {
          ctx.setLineDash([1.5, 2.5])
          ctx.stroke()
          ctx.setLineDash([])
        }

        // Draw Active Node
        if (zRot > 0) {
          ctx.fillStyle = node.isCurrent ? '#e04040' : '#f59e0b'
          ctx.beginPath()
          ctx.arc(sx, sy, 2.5, 0, 2 * Math.PI)
          ctx.fill()

          // Target Pulse
          ctx.strokeStyle = node.isCurrent ? '#e04040' : '#f59e0b'
          ctx.lineWidth = 0.4
          ctx.beginPath()
          ctx.arc(sx, sy, 4.5 + (Math.sin(Date.now() / 120 + (node.lat * 8)) * 1.5), 0, 2 * Math.PI)
          ctx.stroke()

          // Hover Reticle
          const isHovered = hoveredTarget && hoveredTarget.id === node.id
          if (isHovered) {
            ctx.strokeStyle = '#e04040'
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.arc(sx, sy, 8, 0, 2 * Math.PI)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(sx - 11, sy)
            ctx.lineTo(sx + 11, sy)
            ctx.moveTo(sx, sy - 11)
            ctx.lineTo(sx, sy + 11)
            ctx.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(render)
    }

    render()

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let found = null

      const R = Math.min(canvas.width, canvas.height) * 0.36
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const alpha = angleRef.current.alpha

      for (const node of visitorNodes) {
        const theta = node.lat * Math.PI / 180
        const phi = node.lon * Math.PI / 180
        const x = R * Math.cos(theta) * Math.sin(phi)
        const y = R * Math.sin(theta)
        const z = R * Math.cos(theta) * Math.cos(phi)

        const xRot = x * Math.cos(alpha) - z * Math.sin(alpha)
        const zRot = x * Math.sin(alpha) + z * Math.cos(alpha)

        if (zRot > 0) {
          const sx = cx + xRot
          const sy = cy - y

          const cssSx = sx * (rect.width / canvas.width)
          const cssSy = sy * (rect.height / canvas.height)

          const dist = Math.hypot(mx - cssSx, my - cssSy)
          if (dist < 12) {
            found = node
            break
          }
        }
      }

      if (found) {
        setHoveredTarget(found)
        setTooltipPos({ x: e.clientX, y: e.clientY })
      } else {
        setHoveredTarget(null)
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', () => setHoveredTarget(null))

    return () => {
      cancelAnimationFrame(animationId)
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [logs, visitorNodes, hoveredTarget, canvasWidth, canvasHeight])

  return (
    <div className={`threat-globe-widget ${isSidebar ? 'threat-globe-widget--sidebar' : 'threat-globe-widget--main'} card-dark`}>
      <div className="vhs-scanlines vhs-noise"></div>

      <div className="threat-globe-widget__header">
        <div className="status-banner status-banner--danger">
          <span className="status-banner__dot animate-rec"></span>
          <span>INTRUSOS</span>
        </div>
      </div>

      <div className="threat-globe-widget__body">
        <div className="threat-globe-widget__canvas-container">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="threat-globe-canvas"
          />
          <div className="globe-overlay-hud">
            <span>TRACKING: ACTIVE</span>
            <span>BASE: SANTIAGO</span>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredTarget && (
          <div
            className="threat-globe-tooltip"
            style={{
              position: 'fixed',
              left: `${tooltipPos.x + 12}px`,
              top: `${tooltipPos.y + 12}px`,
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          >
            <div className="threat-globe-tooltip__header">
              <Icon name="warning-diamond" />
              <span>{hoveredTarget.isCurrent ? 'SUJETO FIJADO (TÚ)' : `SUJETO-[${hoveredTarget.id.substring(0, 4).toUpperCase()}]`}</span>
            </div>
            <div className="threat-globe-tooltip__content">
              <div className="tooltip-row"><span className="tooltip-lbl">Ubicación:</span> <span className="tooltip-val val--success">{hoveredTarget.city}, {hoveredTarget.country}</span></div>
              <div className="tooltip-row"><span className="tooltip-lbl">IP:</span> <span className="tooltip-val">{hoveredTarget.ip}</span></div>
              <div className="tooltip-row"><span className="tooltip-lbl">SO:</span> <span className="tooltip-val">{hoveredTarget.os} ({hoveredTarget.browser})</span></div>
              <div className="tooltip-row"><span className="tooltip-lbl">Hardware:</span> <span className="tooltip-val">{hoveredTarget.gpu.split('/')[0].substring(0, 16)}</span></div>
              <div className="tooltip-row"><span className="tooltip-lbl">Huella:</span> <span className="tooltip-val val--warning">{hoveredTarget.canvasFingerprint ? hoveredTarget.canvasFingerprint.substring(0, 12) : 'Desconocido'}</span></div>
              <div className="tooltip-row"><span className="tooltip-lbl">Foco:</span> <span className="tooltip-val val--url">{hoveredTarget.page}</span></div>
            </div>
          </div>
        )}

        {/* History table */}
        <div className="threat-globe-widget__history">
          <div className="threat-globe-widget__history-title">HISTORIAL DE CONEXIONES</div>
          <div className="threat-globe-widget__history-scroll">
            <table className="threat-globe-history-table">
              <thead>
                <tr>
                  <th>Lugar</th>
                  <th>País</th>
                  <th style={{ textAlign: 'right' }}>Hits</th>
                </tr>
              </thead>
              <tbody>
                {locationHistory.map((item, idx) => {
                  const isCurrentLoc = item.city === clientData.city && item.country === clientData.country
                  return (
                    <tr key={idx} className={isCurrentLoc ? 'row--current-loc' : ''}>
                      <td>{item.city}</td>
                      <td>{item.country.substring(0, 12)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.count}</td>
                    </tr>
                  )
                })}
                {locationHistory.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>Sin telemetría</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
