import { useState, useEffect } from 'react'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { useVisitorLogs } from '../../../features/visitor/hooks/useVisitorLogs'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { parseUserAgent } from '../../../utils/parseUserAgent'
import { ThreatGlobe } from '../../../components/ui/ThreatGlobe'
import './VisitantesPage.css'
import Icon from '../../../components/ui/Icon'

// Helper: get OS icon
function getOSEmoji(os) {
  const osLower = (os || '').toLowerCase()
  if (osLower.includes('linux')) return <Icon name="terminal" />
  if (osLower.includes('mac') || osLower.includes('ios') || osLower.includes('apple') || osLower.includes('darwin')) return <Icon name="app-mac" />
  if (osLower.includes('win')) return <Icon name="app-windows" />
  if (osLower.includes('android')) return <Icon name="robot" />
  return <Icon name="radio" />
}

function getSatiricalComment(index, action) {
  const comments = [
    "Sospechamos que busca el panel de control.",
    "El cursor del mouse tiembla ligeramente.",
    "Buscando información confidencial...",
    "Se nota un interés excesivo por esta sección.",
    "Intento fallido de pasar desapercibido.",
    "El sujeto parece estar leyendo esta misma advertencia.",
    "Consumo de CPU dentro del rango de nerviosismo.",
    "Navegando con lentitud sospechosa.",
    "Hizo click con un retraso sospechoso de 2.4s.",
    "Se detecta respiración nerviosa del otro lado de la pantalla."
  ]
  return comments[index % comments.length]
}

export function VisitantesPage() {
  const { logs, stats, loading, error } = useVisitorLogs()
  const [selectedSession, setSelectedSession] = useState(null)
  const [activeLabTab, setActiveLabTab] = useState('churn')
  const [inactivitySeconds, setInactivitySeconds] = useState(0)
  const [currentUser, setCurrentUser] = useState({
    ip: 'Escaneando...',
    country: 'Buscando órbita...',
    city: 'Calculando coordenadas...',
    isp: 'Identificando satélite...',
    browser: 'Escaneando...',
    os: 'Escaneando...',
    device: 'Escaneando...',
    battery: 'Midiendo energía...',
    cores: navigator.hardwareConcurrency || 'Desconocido',
    memory: navigator.deviceMemory || 'Desconocido',
    resolution: `${window.screen.width}x${window.screen.height}`,
    lang: navigator.language,
    referrer: document.referrer || 'Acceso Directo',
    deniedGeo: false,
    coords: null,
    visitorId: localStorage.getItem('hachimaki_visitor_id') || 'Generando...',
    visitCount: localStorage.getItem('hachimaki_visitor_count') || '1',
    lastVisitDate: localStorage.getItem('hachimaki_last_visit') || new Date().toISOString(),
    canvasFingerprint: localStorage.getItem('hachimaki_canvas_hash') || 'Calculando...',
    gpuModel: localStorage.getItem('hachimaki_gpu_model') || 'Escaneando...'
  })

  // Control de inactividad en tiempo real (para Churn)
  useEffect(() => {
    const interval = setInterval(() => {
      setInactivitySeconds(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const resetInactivity = () => setInactivitySeconds(0)
    window.addEventListener('mousemove', resetInactivity)
    window.addEventListener('keydown', resetInactivity)
    window.addEventListener('click', resetInactivity)
    
    return () => {
      window.removeEventListener('mousemove', resetInactivity)
      window.removeEventListener('keydown', resetInactivity)
      window.removeEventListener('click', resetInactivity)
    }
  }, [])

  // Solicitud GPS satírica
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUser(prev => ({
            ...prev,
            coords: {
              lat: position.coords.latitude.toFixed(4),
              lon: position.coords.longitude.toFixed(4)
            }
          }))
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setCurrentUser(prev => ({ ...prev, deniedGeo: true }))
          }
        }
      )
    }
  }, [])

  // Carga de metadatos cliente e IP pública
  useEffect(() => {
    const fetchClientStats = async () => {
      const ua = navigator.userAgent
      const { browser, os, deviceType } = parseUserAgent(ua)

      let batteryText = 'Midiendo...'
      try {
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery()
          batteryText = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Enchufado' : 'Consumiéndose'})`
        } else {
          batteryText = 'No disponible (navegas sin batería)'
        }
      } catch (e) {
        batteryText = 'Bloqueada/No disponible'
      }

      setCurrentUser(prev => ({
        ...prev,
        browser,
        os,
        device: deviceType,
        battery: batteryText
      }))

      try {
        const response = await fetch('https://ipapi.co/json/')
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(prev => ({
            ...prev,
            ip: data.ip || 'Oculto',
            country: data.country_name || 'Desconocido',
            city: data.city || 'Desconocido',
            isp: data.org || 'Desconocido'
          }))
        }
      } catch (e) {
        // Silencioso
      }
    }

    fetchClientStats()
  }, [])

  // Group logs by session for "Exposed Stories"
  const sessionsMap = {}
  logs.forEach(log => {
    const sid = log.visitor_id || log.session_id
    if (!sid) return
    if (!sessionsMap[sid]) {
      sessionsMap[sid] = {
        sessionId: sid,
        visitorId: log.visitor_id,
        ip: log.ip || 'Oculto',
        city: log.city || 'Desconocido',
        country: log.country || 'Desconocido',
        browser: log.browser || 'Desconocido',
        os: log.os || 'Desconocido',
        device: log.device_type || 'Desconocido',
        resolution: log.screen_resolution || 'Desconocido',
        referrer: log.referrer || 'Acceso Directo',
        createdAt: log.created_at,
        canvasFingerprint: log.canvas_fingerprint,
        gpuModel: log.gpu_model,
        visitCount: log.visit_count,
        lastVisitDate: log.last_visit_date,
        actions: []
      }
    }
    sessionsMap[sid].actions.push(log)
  })

  // Sort sessions by most recent action
  const sessionsList = Object.values(sessionsMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Sincronizar el expediente seleccionado en tiempo real si llegan nuevos logs
  useEffect(() => {
    if (selectedSession) {
      const updated = sessionsList.find(s => s.sessionId === selectedSession.sessionId)
      if (updated) {
        setSelectedSession(updated)
      }
    }
  }, [logs])

  if (loading) return <PageLoader />
  if (error) return <EmptyState title="SEÑAL DETECTADA CON ERRORES" message={error} />

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (e) {
      return '00:00:00'
    }
  }

  const getActionDescription = (log) => {
    const city = log.city || 'Desconocido'
    const country = log.country || 'Desconocido'
    const subject = `Sujeto-[${log.session_id.substring(0, 4).toUpperCase()}] (${city}, ${country})`

    if (log.action_type === 'session_start') {
      return `${subject} ingresó a la nave desde ${log.referrer === 'Direct' ? 'el hiperespacio' : log.referrer}`
    }
    if (log.action_type === 'page_view') {
      return `${subject} inspeccionó la sección [${log.page_path}]`
    }
    if (log.action_type === 'click') {
      const label = log.action_details?.label || 'un elemento no etiquetado'
      return `${subject} hizo click en '${label}' en [${log.page_path}]`
    }
    return `${subject} ejecutó acción [${log.action_type}]`
  }

  // --- Lógica del Laboratorio Académico de Datos ---
  const sessionKey = localStorage.getItem('hachimaki_visitor_id') || sessionStorage.getItem('hachimaki_visitor_session')
  const currentUserLogs = logs.filter(log => (log.visitor_id || log.session_id) === sessionKey)
  const totalClicks = currentUserLogs.filter(l => l.action_type === 'click').length

  // 1. Churn
  const batteryFactor = currentUser.battery.includes('Consumiéndose') ? 25 : 0
  const churnProb = Math.min(99, Math.max(5, Math.round(5 + inactivitySeconds * 1.3 + batteryFactor)))

  // 2. Afinidad
  const visitedPaths = currentUserLogs.map(l => l.page_path)
  const blogVisits = visitedPaths.filter(p => p.includes('/blog')).length
  const portfolioVisits = visitedPaths.filter(p => p.includes('/portfolio')).length
  const photosVisits = visitedPaths.filter(p => p.includes('/photos')).length
  const systemVisits = visitedPaths.filter(p => p.includes('/visitantes')).length
  
  const totalPoints = blogVisits + portfolioVisits + photosVisits + systemVisits || 1
  const blogAffinity = Math.round((blogVisits / totalPoints) * 100)
  const portfolioAffinity = Math.round((portfolioVisits / totalPoints) * 100)
  const photosAffinity = Math.round((photosVisits / totalPoints) * 100)
  const systemAffinity = Math.round((systemVisits / totalPoints) * 100)

  // 3. Intención de conversión
  const criticalClicks = currentUserLogs.filter(l => 
    l.action_type === 'click' && 
    (l.action_details?.label?.toLowerCase().includes('github') || 
     l.action_details?.label?.toLowerCase().includes('linkedin') ||
     l.action_details?.label?.toLowerCase().includes('stream') ||
     l.page_path.includes('stream') ||
     l.page_path.includes('portfolio/'))
  ).length

  let intentClass = 'Rebote Frío (Tráfico incidental)'
  let intentDesc = 'Has interactuado muy poco con elementos clave de La Nave. Para los algoritmos comerciales de Ads, eres clasificado como un visitante fortuito de bajo valor publicitario por ahora.'
  
  if (criticalClicks >= 2 || (totalClicks >= 6 && (blogVisits > 0 || portfolioVisits > 0))) {
    intentClass = 'Lead Caliente (Alta Intención de Conversión)'
    intentDesc = 'Demuestras interés activo en portafolios, streams o redes externas del autor. Eres el blanco perfecto para anuncios directos de herramientas de desarrollo o servicios cloud.'
  } else if (totalClicks >= 3 || visitedPaths.length >= 3) {
    intentClass = 'Curioso Pasivo (Interés Medio)'
    intentDesc = 'Exploras el entorno sin comprometerte con enlaces externos. Eres catalogado como apto para campañas de retargeting diseñadas para captar tu atención lentamente.'
  }

  // 4. Buyer Persona
  let personaName = 'Usuario Estándar de Órbita'
  let personaDesc = 'Navegas con especificaciones técnicas estándar. Eres indexado en el grupo demográfico masivo de consumo general.'
  
  const isLinux = (currentUser.os || '').toLowerCase().includes('linux')
  const isMac = (currentUser.os || '').toLowerCase().includes('mac') || (currentUser.os || '').toLowerCase().includes('ios')
  const isMobile = currentUser.device === 'Mobile'
  const cpuCores = parseInt(currentUser.cores) || 0

  if (isLinux && cpuCores >= 8) {
    personaName = 'Desarrollador Power-User / Técnico de TI'
    personaDesc = 'Navegas en Linux en un equipo multihilo potente. Valoras la privacidad, probablemente usas adblockers avanzados y estás auditando este código con criterio de seguridad.'
  } else if (isMac) {
    personaName = 'Creativo Premium / Sector macOS'
    personaDesc = 'El ecosistema Apple te segmenta de inmediato en un nicho de mercado con alta disposición a pagar por diseño, exclusividad y comodidad.'
  } else if (isMobile) {
    personaName = 'Consumidor Móvil Express'
    personaDesc = 'Accedes desde un dispositivo móvil. Buscas información rápida en diagonal y eres propenso a micro-conversiones de un solo toque.'
  }

  return (
    <PageWrapper className="visitors-page">
      <div className="vhs-scanlines vhs-noise"></div>

      <header className="visitors-page__header">
        <h1 className="visitors-page__title">
          <span className="visitors-page__glow">SISTEMA DE VIGILANCIA</span>
          <span className="visitors-page__badge">COBERTURA DE LA NAVE: 100%</span>
        </h1>
        <p className="visitors-page__subtitle">
          El botón REC de arriba a la derecha no está parpadeando por gusto. Todo movimiento es registrado y transmitido. Al ingresar a La Nave, declaras estar de acuerdo con ser observado.
        </p>
      </header>

      {/* Historias de Intrusos Expuestos */}
      <section className="exposed-stories">
        <h2 className="exposed-stories__title">HISTORIAS DE INTRUSOS EXPUESTOS (CLIC PARA INSPECCIONAR EXPEDIENTE)</h2>
        <div className="exposed-stories__list">
          {sessionsList.map((session) => {
            const emoji = getOSEmoji(session.os)
            const initials = session.sessionId.substring(0, 4).toUpperCase()
            const isCurrentUser = session.sessionId === (localStorage.getItem('hachimaki_visitor_id') || sessionStorage.getItem('hachimaki_visitor_session'))
            
            return (
              <button
                key={session.sessionId}
                className={`story-circle ${isCurrentUser ? 'story-circle--current' : ''} ${selectedSession?.sessionId === session.sessionId ? 'story-circle--active' : ''}`}
                onClick={() => setSelectedSession(session)}
                title={`Inspeccionar expediente de Sujeto-${initials}`}
              >
                <div className="story-circle__avatar-wrapper">
                  <div className="story-circle__avatar">
                    <span className="story-circle__emoji">{emoji}</span>
                  </div>
                  {isCurrentUser && <span className="story-circle__you-badge">TÚ</span>}
                </div>
                <span className="story-circle__name">Sujeto-{initials}</span>
                <span className="story-circle__location">{session.city}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Threat Globe Tracker */}
      <ThreatGlobe logs={logs} />

      <div className="visitors-grid">
        {/* Columna Izquierda: Expediente del Usuario */}
        <section className="dossier-card">
          <div className="dossier-card__header">
            <span className="dossier-card__marker">///</span>
            <h2 className="dossier-card__title">TU EXPEDIENTE DE INTRUSO</h2>
          </div>

          <div className="dossier-card__content">
            <div className="dossier-row">
              <span className="dossier-label">IDENTIDAD PERSISTENTE (ID):</span>
              <span className="dossier-value dossier-value--warning">{currentUser.visitorId}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">HISTORIAL DE VISITAS:</span>
              <span className="dossier-value">Visita Nº {currentUser.visitCount} (Última: {new Date(currentUser.lastVisitDate).toLocaleDateString()})</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">HUELLA BIOMÉTRICA (CANVAS):</span>
              <span className="dossier-value dossier-value--highlight" title="Generada por micro-variaciones en cómo tu GPU dibuja píxeles. Imposible de ocultar.">{currentUser.canvasFingerprint}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">UNIDAD GRÁFICA (GPU):</span>
              <span className="dossier-value">{currentUser.gpuModel}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">DIRECCIÓN IP:</span>
              <span className="dossier-value dossier-value--highlight">{currentUser.ip}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">SATÉLITE / ISP:</span>
              <span className="dossier-value">{currentUser.isp}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">LUGAR DE ORIGEN:</span>
              <span className="dossier-value">{currentUser.city}, {currentUser.country}</span>
            </div>

            <div className="dossier-row dossier-row--vertical">
              <span className="dossier-label">TRIANGULACIÓN GEOGRÁFICA:</span>
              {currentUser.coords ? (
                <span className="dossier-value dossier-value--success">
                  LATITUD: {currentUser.coords.lat} | LONGITUD: {currentUser.coords.lon} (Totalmente expuesto)
                </span>
              ) : currentUser.deniedGeo ? (
                <span className="dossier-value dossier-value--danger dossier-value--blink">
                  <Icon name="warning-diamond" /> ALERTA: PARANOICO DETECTADO. Has bloqueado el GPS. Intentas esconderte... No servirá de nada.
                </span>
              ) : (
                <span className="dossier-value dossier-value--warning">
                  Solicitando triangulación... (Acepta el GPS si eres lo suficientemente valiente)
                </span>
              )}
            </div>

            <div className="dossier-divider"></div>

            <div className="dossier-row">
              <span className="dossier-label">SISTEMA OPERATIVO:</span>
              <span className="dossier-value">{currentUser.os} ({currentUser.device})</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">HERRAMIENTA / NAVEGADOR:</span>
              <span className="dossier-value">{currentUser.browser}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">RESO. PANTALLA:</span>
              <span className="dossier-value">{currentUser.resolution}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">HILOS DE CPU:</span>
              <span className="dossier-value">{currentUser.cores} hilos rastreándote</span>
            </div>
            {currentUser.memory !== 'Desconocido' && (
              <div className="dossier-row">
                <span className="dossier-label">MEMORIA DE ABORDO:</span>
                <span className="dossier-value">~{currentUser.memory} GB de RAM</span>
              </div>
            )}
            <div className="dossier-row">
              <span className="dossier-label">ENERGÍA DE DISPOSITIVO:</span>
              <span className="dossier-value dossier-value--battery">{currentUser.battery}</span>
            </div>
            <div className="dossier-row dossier-row--vertical">
              <span className="dossier-label">PROCEDENCIA DE RED:</span>
              <span className="dossier-value dossier-value--url">{currentUser.referrer}</span>
            </div>
          </div>

          <div className="dossier-card__footer">
            <span className="dossier-status-dot animate-rec"></span>
            TRANSMISIÓN DE LA NAVE EN VIVO
          </div>
        </section>

        {/* Columna Derecha: Estadísticas y Ticker en Tiempo Real */}
        <div className="stats-and-feed">
          {/* Fichas de Estadísticas */}
          <section className="stats-panel">
            <div className="stats-tile">
              <div className="stats-tile__value">{stats.uniqueSessions}</div>
              <div className="stats-tile__label">INTRUSOS (24H)</div>
            </div>
            <div className="stats-tile">
              <div className="stats-tile__value">{stats.totalLogs}</div>
              <div className="stats-tile__label">ACCIONES DETECTADAS</div>
            </div>
            <div className="stats-tile">
              <div className="stats-tile__value">{stats.clicksCount}</div>
              <div className="stats-tile__label">CLICS PREDECIBLES</div>
            </div>
          </section>

          {/* Resumen de Inteligencia */}
          <section className="stats-summary-card">
            <div className="stats-summary-card__header">
              <h3 className="stats-summary-card__title">DATOS AGREGADOS RECIENTES</h3>
            </div>
            <div className="stats-summary-card__content">
              <div className="summary-row">
                <span>SECTOR MÁS CODICIADO:</span>
                <span className="summary-val">{stats.topPage}</span>
              </div>
              <div className="summary-row">
                <span>PLANETA / PROCEDENCIA LÍDER:</span>
                <span className="summary-val">{stats.topCountry}</span>
              </div>
            </div>
          </section>

          {/* Consola Terminal de Log en Vivo */}
          <section className="terminal-card">
            <div className="terminal-card__header">
              <div className="terminal-card__dots">
                <span className="terminal-dot terminal-dot--red"></span>
                <span className="terminal-dot terminal-dot--yellow"></span>
                <span className="terminal-dot terminal-dot--green"></span>
              </div>
              <span className="terminal-card__title">CONSOLA_DE_VIGILANCIA.LOG</span>
            </div>

            <div className="terminal-card__body">
              {logs.length === 0 ? (
                <div className="terminal-empty">NO SE DETECTAN INTRUSOS EN LA ÓRBITA ACTUAL</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`terminal-line terminal-line--${log.action_type}`}>
                    <span className="terminal-time">[{formatTime(log.created_at)}]</span>
                    <span className="terminal-action"> {getActionDescription(log)}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Laboratorio Académico de Inteligencia de Datos */}
      <section className="data-lab">
        <div className="data-lab__header">
          <span className="data-lab__tag">SISTEMA_DE_APRENDIZAJE</span>
          <h2 className="data-lab__title">LABORATORIO DE INTELIGENCIA DE DATOS</h2>
          <p className="data-lab__intro">
            Cuando navegas por Internet, cada clic, movimiento y especificación de tu máquina es oro para las corporaciones. Aquí te enseñamos didácticamente cómo los algoritmos de Big Tech analizan y capitalizan las huellas que acabas de dejar en La Nave.
          </p>
        </div>

        <div className="data-lab__tabs">
          <button 
            className={`data-lab__tab-btn ${activeLabTab === 'churn' ? 'data-lab__tab-btn--active' : ''}`}
            onClick={() => setActiveLabTab('churn')}
          >
            <Icon name="speed-fast" />‍<Icon name="user" />️ Predicción de Fuga
          </button>
          <button 
            className={`data-lab__tab-btn ${activeLabTab === 'affinity' ? 'data-lab__tab-btn--active' : ''}`}
            onClick={() => setActiveLabTab('affinity')}
          >
            <Icon name="analytics" /> Afinidad de Contenido
          </button>
          <button 
            className={`data-lab__tab-btn ${activeLabTab === 'intent' ? 'data-lab__tab-btn--active' : ''}`}
            onClick={() => setActiveLabTab('intent')}
          >
            <Icon name="target" /> Intención de Compra
          </button>
          <button 
            className={`data-lab__tab-btn ${activeLabTab === 'persona' ? 'data-lab__tab-btn--active' : ''}`}
            onClick={() => setActiveLabTab('persona')}
          >
            <Icon name="robot" /> Perfil de Consumidor
          </button>
        </div>

        <div className="data-lab__content-panel">
          {/* Fuga/Churn */}
          {activeLabTab === 'churn' && (
            <div className="tab-pane">
              <div className="tab-pane__theory">
                <h3>¿Cómo se predice cuándo vas a abandonar un sitio? (Churn Rate)</h3>
                <p>
                  Las plataformas analizan tu inactividad segundo a segundo. Si dejas de mover el cursor, cambias de pestaña, o la batería de tu dispositivo baja rápido, algoritmos predictivos (como XGBoost o Random Forest) estiman la probabilidad de que vayas a cerrar el sitio para intentar retenerte con popups de descuento intrusivos o acelerar tus decisiones comerciales antes de que te desconectes.
                </p>
                <div className="tab-pane__formula">
                  <strong>Ecuación Teórica del Sensor:</strong>
                  <code>Probabilidad = (Inactividad (segundos) * 1.3) + (Batería % invertida si no carga) + (Ausencia de clics recientes)</code>
                </div>
              </div>
              
              <div className="tab-pane__verdict">
                <h4>TU ESTIMACIÓN DE FUGA EN VIVO:</h4>
                <div className="churn-meter">
                  <div className="churn-meter__gauge">
                    <div 
                      className="churn-meter__fill" 
                      style={{ width: `${churnProb}%` }}
                    ></div>
                  </div>
                  <span className="churn-meter__value">
                    {churnProb}% de Probabilidad de Abandono de La Nave
                  </span>
                </div>
                <div className="verdict-note">
                  {inactivitySeconds > 5 
                    ? `<Icon name="warning-diamond" /> Llevas ${inactivitySeconds} segundos inactivo. El temporizador incrementa el riesgo de rebote.` 
                    : `<Icon name="circle" /> Estado Activo. Te mantienes moviendo el cursor o cliqueando dentro de la pestaña.`}
                </div>
                
                <div className="privacy-conclusion">
                  <h5><Icon name="lightbulb" /> ¿POR QUÉ ES IMPORTANTE Y DEBERÍAS ESTAR INFORMADO?</h5>
                  <p>
                    Las aerolíneas y plataformas de reservas hoteleras detectan cuando navegas con batería críticamente baja. Si su algoritmo detecta urgencia (poca batería, inactividad larga seguida de clics erráticos), puede incrementar dinámicamente las tarifas de lo que buscas, asumiendo que comprarás apresuradamente antes de que tu dispositivo se apague.
                  </p>
                  <span className="privacy-conclusion__action">
                    <Icon name="shield" />️ <strong>Recomendación de Seguridad:</strong> Instala extensiones que bloqueen telemetría de hardware (Battery API Blocker), evita realizar transacciones importantes con batería crítica y mantén siempre el cursor en movimiento o desactiva JavaScript si no es estrictamente necesario al comparar tarifas de vuelos.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Afinidad */}
          {activeLabTab === 'affinity' && (
            <div className="tab-pane">
              <div className="tab-pane__theory">
                <h3>¿Cómo miden tus gustos y afinidades de contenido?</h3>
                <p>
                  Cada segundo que pasas leyendo un artículo de blog o mirando un proyecto de portfolio es transformado en un puntaje de afinidad. Si pasas el 80% de tu tiempo en la galería de fotos, se te etiquetará en las bases de datos de publicidad comercial como "Aficionado a la fotografía". Esto sirve para recomendarte productos y para vender tu perfil en subastas de anuncios en milisegundos.
                </p>
                <div className="tab-pane__formula">
                  <strong>Ecuación de Afinidad:</strong>
                  <code>Afinidad(X) = (Clicks en X + Páginas de X) / Total de Interacciones</code>
                </div>
              </div>
              
              <div className="tab-pane__verdict">
                <h4>TU MATRIZ DE INTERESES EN LA NAVE:</h4>
                <div className="affinity-list">
                  <div className="affinity-row">
                    <span className="affinity-name">Sección Blog:</span>
                    <div className="affinity-bar"><div className="affinity-bar__fill" style={{ width: `${blogAffinity}%` }}></div></div>
                    <span className="affinity-val">{blogAffinity}%</span>
                  </div>
                  <div className="affinity-row">
                    <span className="affinity-name">Sección Portfolio:</span>
                    <div className="affinity-bar"><div className="affinity-bar__fill" style={{ width: `${portfolioAffinity}%` }}></div></div>
                    <span className="affinity-val">{portfolioAffinity}%</span>
                  </div>
                  <div className="affinity-row">
                    <span className="affinity-name">Sección Fotos:</span>
                    <div className="affinity-bar"><div className="affinity-bar__fill" style={{ width: `${photosAffinity}%` }}></div></div>
                    <span className="affinity-val">{photosAffinity}%</span>
                  </div>
                  <div className="affinity-row">
                    <span className="affinity-name">Sección Vigilancia (Sistemas):</span>
                    <div className="affinity-bar"><div className="affinity-bar__fill" style={{ width: `${systemAffinity}%` }}></div></div>
                    <span className="affinity-val">{systemAffinity}%</span>
                  </div>
                </div>
                
                <div className="privacy-conclusion">
                  <h5><Icon name="lightbulb" /> EL CASO TIKTOK Y EL CONTROL SOCIAL</h5>
                  <p>
                    El cálculo de afinidad es el motor del <strong>"Filtro Burbuja"</strong>, llevado a su extremo por plataformas como TikTok. Al medir el tiempo exacto en milisegundos que pasas viendo un video antes de hacer scroll, el algoritmo de TikTok crea un perfil psicométrico perfecto de tus inseguridades, sesgos políticos y visión de vida.
                  </p>
                  <p>
                    Esto es perverso: los gobiernos pueden usar (y han sido acusados de usar) estas redes como armas de ingeniería social masiva. Al controlar el algoritmo, deciden qué ve, oye y reacciona una población entera. Pueden suprimir contenido político disidente de forma invisible (shadowbanning), o inundar el feed de jóvenes con tendencias depresivas o hiper-polarizantes. No eres el cliente, eres el producto siendo moldeado.
                  </p>
                  <span className="privacy-conclusion__action">
                    <Icon name="shield" />️ <strong>Defensa Activa:</strong> Desconfía del "scroll infinito". Alimenta deliberadamente al algoritmo con intereses falsos o contradictorios, usa plataformas open-source sin algoritmos predictivos (como Mastodon), y limita el uso de aplicaciones que exigen acceso al portapapeles, contactos y sensores sin justificación.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Intención */}
          {activeLabTab === 'intent' && (
            <div className="tab-pane">
              <div className="tab-pane__theory">
                <h3>¿Cómo infieren si vas a comprar o si solo estás mirando?</h3>
                <p>
                  No todos los usuarios valen lo mismo. Las empresas filtran el tráfico en embudos de conversión (funnels). Un clic en un enlace de GitHub, de LinkedIn, o ver los detalles de un stream eleva tu estatus a "Lead Caliente". Los sistemas de remarketing usan esto para perseguirte en otros sitios web con anuncios invasivos del autor que acabas de ver.
                </p>
                <div className="tab-pane__formula">
                  <strong>Árbol de Decisión Comercial:</strong>
                  <code>{"Clics Críticos >= 2 = Lead Caliente | Clics Generales >= 3 = Curioso Pasivo | Menos = Tráfico de Rebote"}</code>
                </div>
              </div>
              
              <div className="tab-pane__verdict">
                <h4>TU CATEGORIZACIÓN DE INTENCIÓN DETECTADA:</h4>
                <div className="intent-card">
                  <div className="intent-card__badge">{intentClass}</div>
                  <p className="intent-card__desc">{intentDesc}</p>
                </div>
                <div className="verdict-note">
                  Registramos {totalClicks} clics totales y {criticalClicks} clics en disparadores críticos de contacto o enlaces externos durante esta pestaña de navegación.
                </div>
                
                <div className="privacy-conclusion">
                  <h5><Icon name="lightbulb" /> ¿POR QUÉ ES IMPORTANTE Y DEBERÍAS ESTAR INFORMADO?</h5>
                  <p>
                    Si un sitio de reservas aéreas o comercio electrónico detecta una alta "intención de conversión" (por ejemplo, buscaste el mismo hotel 3 veces), ocultará cupones activos o inflará la escasez con alertas de "¡Solo queda 1 habitación disponible!". Tu propio historial de clics se usa en tu contra para obligarte a pagar más rápido.
                  </p>
                  <span className="privacy-conclusion__action">
                    <Icon name="shield" />️ <strong>Recomendación de Seguridad:</strong> Realiza las búsquedas iniciales de productos o vuelos usando ventanas de navegación privada limpias, y no inicies sesión en la tienda hasta que estés seguro de realizar la transacción para evitar que asocien tu intención alta con tu perfil.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Persona */}
          {activeLabTab === 'persona' && (
            <div className="tab-pane">
              <div className="tab-pane__theory">
                <h3>¿Cómo se infiere tu poder adquisitivo y tu Buyer Persona?</h3>
                <p>
                  Tus metadatos de hardware y red revelan tu estatus socioeconómico de inmediato. Navegar desde un iPhone Pro de última generación o una MacBook con procesador Apple Silicon clasifica tu sesión como "Segmento de Ingreso Alto" en las bases de datos de subastas publicitarias en comparación con terminales antiguos.
                </p>
                <div className="tab-pane__formula">
                  <strong>Matriz de Demografía Técnica:</strong>
                  <code>Cruce de OS + Núcleos CPU + Resolución para inferir la demografía del usuario.</code>
                </div>
              </div>
              
              <div className="tab-pane__verdict">
                <h4>ARQUETIPO DE CONSUMIDOR INFERIDO EN VIVO:</h4>
                <div className="persona-card">
                  <div className="persona-card__badge">{personaName}</div>
                  <p className="persona-card__desc">{personaDesc}</p>
                </div>
                
                <div className="privacy-conclusion">
                  <h5><Icon name="lightbulb" /> ¿POR QUÉ ES IMPORTANTE Y DEBERÍAS ESTAR INFORMADO?</h5>
                  <p>
                    La discriminación de precios basada en el User-Agent y el hardware es una realidad silenciosa. Múltiples plataformas de reservas hoteleras y de alquiler de autos han sido reportadas por mostrar tarifas incrementadas si detectan que accedes desde sistemas operativos premium como macOS o iOS en comparación con Android o Windows.
                  </p>
                  <span className="privacy-conclusion__action">
                    <Icon name="shield" />️ <strong>Recomendación de Seguridad:</strong> Utiliza extensiones de navegador que alteren aleatoriamente tu User-Agent (User-Agent Switcher) para simular dispositivos de escritorio comunes o genéricos, bloqueando la telemetría exhaustiva de hardware en tus navegadores de uso diario.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalle de Expediente / Historia */}
      {selectedSession && (
        <div className="dossier-modal" onClick={() => setSelectedSession(null)}>
          <div className="dossier-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="dossier-modal__header">
              <span className="dossier-modal__badge">INFORMACIÓN EXPUESTA</span>
              <h3 className="dossier-modal__title">SUJETO-[{selectedSession.sessionId.substring(0, 8).toUpperCase()}]</h3>
              <button className="dossier-modal__close" onClick={() => setSelectedSession(null)}><Icon name="close" /></button>
            </div>
            
            <div className="dossier-modal__body">
              <div className="dossier-modal__grid">
                <div className="dossier-modal__meta">
                  <div className="modal-meta-row">
                    <span className="meta-label">DIRECCIÓN IP:</span>
                    <span className="meta-value dossier-value--highlight">{selectedSession.ip}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">ÓRBITA / ORIGEN:</span>
                    <span className="meta-value">{selectedSession.city}, {selectedSession.country}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">SISTEMA:</span>
                    <span className="meta-value">{selectedSession.os} ({selectedSession.device})</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">RECEPTOR:</span>
                    <span className="meta-value">{selectedSession.browser}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">RESOLUCIÓN:</span>
                    <span className="meta-value">{selectedSession.resolution}</span>
                  </div>
                  <div className="modal-meta-row dossier-row--vertical">
                    <span className="meta-label">PORTAL DE ENTRADA:</span>
                    <span className="meta-value dossier-value--url">{selectedSession.referrer}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">VISITAS:</span>
                    <span className="meta-value">Visita Nº {selectedSession.visitCount || '1'}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">GPU:</span>
                    <span className="meta-value">{selectedSession.gpuModel || 'Desconocido'}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="meta-label">CANVAS HASH:</span>
                    <span className="meta-value dossier-value--highlight">{selectedSession.canvasFingerprint || 'Oculto'}</span>
                  </div>
                </div>

                <div className="dossier-modal__timeline">
                  <h4 className="timeline-title">HISTORIA DE NAVEGACIÓN EN LA NAVE</h4>
                  <div className="timeline-list">
                    {selectedSession.actions.map((action, idx) => {
                      const time = formatTime(action.created_at)
                      let detailText = ''
                      if (action.action_type === 'session_start') {
                        detailText = `Abordó La Nave desde ${action.referrer === 'Direct' ? 'el hiperespacio' : action.referrer}`
                      } else if (action.action_type === 'page_view') {
                        detailText = `Inspeccionó la sección: [${action.page_path}]`
                      } else if (action.action_type === 'click') {
                        const label = action.action_details?.label || 'un elemento no etiquetado'
                        detailText = `Hizo click en '${label}' en [${action.page_path}]`
                      } else {
                        detailText = `Ejecutó acción [${action.action_type}]`
                      }
                      
                      return (
                        <div key={action.id || idx} className="timeline-item">
                          <div className="timeline-item-meta">
                            <span className="timeline-time">[{time}]</span>
                            <span className="timeline-action"> {detailText}</span>
                          </div>
                          {idx % 3 === 1 && (
                            <div className="timeline-note">
                              [Nota del Sistema: {getSatiricalComment(idx, action)}]
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="dossier-modal__footer">
              <span className="dossier-status-dot animate-rec"></span>
              EXPEDIENTE CREADO A PARTIR DE HUELLAS DIGITALES PÚBLICAS
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
