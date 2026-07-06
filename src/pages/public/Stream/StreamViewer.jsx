import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '../../../features/streaming/hooks/useRooms'
import { usePresence } from '../../../features/streaming/hooks/usePresence'
import { useChat } from '../../../features/streaming/hooks/useChat'
import { createSignalingChannel } from '../../../features/streaming/lib/signalingChannel'
import { createViewerPeer } from '../../../features/streaming/lib/viewerPeer'
import { createStreamLogger } from '../../../features/streaming/lib/streamLogger'
import { StreamChat } from './StreamChat'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import './ViewerPage.css'
import { useSpeechTranscription } from '../../../features/streaming/hooks/useSpeechTranscription'
import Icon from '../../../components/ui/Icon'

const log = createStreamLogger('StreamViewer')

/**
 * @typedef {'loading'|'connecting'|'connected'|'reconnecting'|'offline'|'ended'|'error'} ViewerState
 */

export function StreamViewer({ slug, onClose }) {
  const navigate = useNavigate()

  /* State */
  const [room, setRoom] = useState(null)
  const [roomLoading, setRoomLoading] = useState(true)
  /** @type {[ViewerState, function]} */
  const [viewerState, setViewerState] = useState('loading')
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  /* Refs */
  const videoRef = useRef(null)
  const signalingRef = useRef(null)
  const viewerPeerRef = useRef(null)
  const viewerIdRef = useRef(crypto.randomUUID())

  /* Hooks */
  const { getRoomBySlug } = useRooms()
  const { viewerCount, joinRoom, getOrCreateViewerId } = usePresence(room?.id, 'viewer')
  const viewerId = viewerIdRef.current
  const { messages, sendMessage } = useChat(room?.id, viewerId, `Viewer-${viewerId.slice(0, 4)}`)

  const { transcripts } = useSpeechTranscription(room?.id, 'viewer')
  const [showCC, setShowCC] = useState(true)
  const [activeCaption, setActiveCaption] = useState('')

  /* Update active subtitle when a new transcript arrives */
  useEffect(() => {
    if (transcripts.length > 0) {
      const latest = transcripts[transcripts.length - 1]
      setActiveCaption(latest.text)

      /* Clear subtitle after 6 seconds of silence */
      const timer = setTimeout(() => {
        setActiveCaption('')
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [transcripts])

  /* ── Load room ── */
  useEffect(() => {
    async function loadRoom() {
      const r = await getRoomBySlug(slug)
      if (!r) {
        setViewerState('error')
      } else if (r.status === 'ended' || r.status === 'offline') {
        setRoom(r)
        setViewerState('offline')
      } else {
        // Auth check for private rooms
        if (r.is_private && !sessionStorage.getItem(`room_auth_${r.id}`)) {
          navigate(`/stream/${r.slug}`)
          return
        }
        setRoom(r)
        setViewerState('connecting')
      }
      setRoomLoading(false)
    }

    if (slug) loadRoom()
  }, [slug, getRoomBySlug, navigate])

  /* ── Join room and set up WebRTC ── */
  useEffect(() => {
    if (!room || viewerState === 'offline' || viewerState === 'error' || viewerState === 'ended') return

    joinRoom()

    /* Create signaling channel */
    const signaling = createSignalingChannel(room.id, viewerId)
    signalingRef.current = signaling

    /* Create viewer peer */
    const peer = createViewerPeer({
      onAnswer: (sdp) => {
        signaling.sendAnswer(room.caster_id, sdp)
      },
      onIceCandidate: (candidate) => {
        signaling.sendIceCandidate(room.caster_id, candidate)
      },
      onTrack: (remoteStream) => {
        log.info('Received remote stream')
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream
          videoRef.current.play().then(() => {
            setAutoplayBlocked(false)
          }).catch((err) => {
            log.warn('Autoplay blocked:', err.message)
            setAutoplayBlocked(true)
          })
        }
        setViewerState('connected')
      },
      onStateChange: (state) => {
        log.info('Viewer state:', state)
        if (state === 'connected') setViewerState('connected')
        if (state === 'reconnecting') setViewerState('reconnecting')
        if (state === 'failed') setViewerState('reconnecting')
        if (state === 'disconnected') setViewerState('offline')
      },
    })
    viewerPeerRef.current = peer

    /* Subscribe to signaling */
    signaling.subscribe((msg) => {
      switch (msg.type) {
        case 'offer':
          peer.handleOffer(msg.payload.sdp)
          break
        case 'ice-candidate':
          peer.handleIceCandidate(msg.payload.candidate)
          break
      }
    }).then(() => {
      /* Announce to caster ONLY after successfully subscribed */
      signaling.sendViewerReady()
    }).catch(err => log.error('Signaling error:', err))

    return () => {
      peer.disconnect()
      signaling.unsubscribe()
    }
  }, [room?.id, viewerId, joinRoom, viewerState])

  /* ── Fullscreen toggle ── */
  const videoWrapperRef = useRef(null)

  const toggleFullscreen = useCallback(() => {
    const el = videoWrapperRef.current
    if (!el) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen().catch((err) => {
        log.warn('Fullscreen failed:', err)
      })
    }
  }, [])

  /* ── Render ── */
  if (roomLoading) return <PageLoader />

  if (viewerState === 'error') {
    return (
      <div className="viewer-page">
        <EmptyState
          title="Sala no encontrada"
          description="La sala de streaming que buscas no existe o fue eliminada."
        />
        {onClose && (
          <button className="btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={onClose}>
            Volver
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="viewer-page">
      {/* Top bar */}
      <div className="viewer-page__topbar">
        <h1 className="viewer-page__title">
          {room?.title || 'Stream'}
        </h1>
        <div className="viewer-page__badges">
          {viewerState === 'connected' && (
            <span className="viewer-page__live-badge">LIVE</span>
          )}
          <span className="viewer-page__stat viewer-page__stat--viewers">
            <Icon name="eye" /> {viewerCount}
          </span>
          {onClose && (
             <button className="viewer-page__close-btn" onClick={onClose} title="Cerrar reproductor">
               <Icon name="close" />
             </button>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="viewer-page__video-area">
        <div className="viewer-page__video-wrapper" ref={videoWrapperRef}>
          <video
            ref={videoRef}
            className="viewer-page__video"
            autoPlay
            playsInline
            muted={isMuted}
          />

          {/* Unmute button */}
          {isMuted && viewerState === 'connected' && (
            <button
              className="viewer-page__unmute-btn"
              onClick={() => {
                setIsMuted(false)
                if (videoRef.current) {
                  videoRef.current.muted = false
                }
              }}
              title="Activar Sonido"
            >
              <Icon name="volume-1" /> Haz clic para activar el sonido
            </button>
          )}

          {/* CC Toggle button */}
          {viewerState === 'connected' && (
            <button
              className={`viewer-page__cc-btn ${showCC ? 'viewer-page__cc-btn--active' : ''}`}
              onClick={() => setShowCC((prev) => !prev)}
              title={showCC ? 'Desactivar Subtítulos (CC)' : 'Activar Subtítulos (CC)'}
            >
              CC
            </button>
          )}

          {/* Fullscreen button */}
          <button
            className="viewer-page__fullscreen-btn"
            onClick={toggleFullscreen}
            title="Pantalla completa"
          >
            <Icon name="expand" />
          </button>

          {/* Closed Captions Overlay */}
          {showCC && activeCaption && viewerState === 'connected' && (
            <div className="viewer-page__captions-overlay">
              <p className="viewer-page__captions-text">{activeCaption}</p>
            </div>
          )}

          {/* Status overlays */}
          {viewerState === 'connecting' && (
            <div className="viewer-page__status-overlay">
              <div className="viewer-page__spinner" />
              <span className="viewer-page__status-text">Conectando al stream…</span>
              <span className="viewer-page__status-subtext">
                Esperando señal del emisor
              </span>
            </div>
          )}

          {viewerState === 'reconnecting' && (
            <div className="viewer-page__status-overlay">
              <span className="viewer-page__status-icon"><Icon name="reload" /></span>
              <span className="viewer-page__status-text viewer-page__reconnecting">
                Reconectando…
              </span>
              <span className="viewer-page__status-subtext">
                La conexión se interrumpió temporalmente
              </span>
            </div>
          )}

          {viewerState === 'offline' && (
            <div className="viewer-page__status-overlay">
              <span className="viewer-page__status-icon"><Icon name="radio" /></span>
              <span className="viewer-page__status-text">Stream Offline</span>
              <span className="viewer-page__status-subtext">
                El emisor no está transmitiendo en este momento
              </span>
            </div>
          )}

          {autoplayBlocked && viewerState === 'connected' && (
            <div className="viewer-page__status-overlay" style={{ background: 'rgba(0,0,0,0.8)', cursor: 'pointer' }} onClick={() => {
              if (videoRef.current) {
                videoRef.current.play().then(() => setAutoplayBlocked(false))
              }
            }}>
              <span className="viewer-page__status-icon"><Icon name="play" />️</span>
              <span className="viewer-page__status-text">Haz clic para iniciar el video</span>
              <span className="viewer-page__status-subtext">
                Tu navegador bloqueó la reproducción automática
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="viewer-page__sidebar">
        <StreamChat
          messages={messages}
          onSend={sendMessage}
        />
      </div>
    </div>
  )
}
