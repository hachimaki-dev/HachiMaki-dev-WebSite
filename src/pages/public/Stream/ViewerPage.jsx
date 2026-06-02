/**
 * ViewerPage.jsx — Stream viewer (spectator) page
 *
 * Receives WebRTC stream from the caster,
 * auto-plays with reconnection, shows viewer count,
 * and includes fullscreen toggle + live chat.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
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

const log = createStreamLogger('ViewerPage')

/**
 * @typedef {'loading'|'connecting'|'connected'|'reconnecting'|'offline'|'ended'|'error'} ViewerState
 */

export function ViewerPage() {
  const { slug } = useParams()

  /* State */
  const [room, setRoom] = useState(null)
  const [roomLoading, setRoomLoading] = useState(true)
  /** @type {[ViewerState, function]} */
  const [viewerState, setViewerState] = useState('loading')

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
        setRoom(r)
        setViewerState('connecting')
      }
      setRoomLoading(false)
    }

    if (slug) loadRoom()
  }, [slug, getRoomBySlug])

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
          videoRef.current.play().catch((err) => {
            log.warn('Autoplay blocked:', err.message)
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
    })

    /* Announce to caster */
    signaling.sendViewerReady()

    return () => {
      peer.disconnect()
      signaling.unsubscribe()
    }
  }, [room, viewerId, joinRoom, viewerState])

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
            👁 {viewerCount}
          </span>
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
          />

          {/* Fullscreen button */}
          <button
            className="viewer-page__fullscreen-btn"
            onClick={toggleFullscreen}
            title="Pantalla completa"
          >
            ⛶
          </button>

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
              <span className="viewer-page__status-icon">🔄</span>
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
              <span className="viewer-page__status-icon">📡</span>
              <span className="viewer-page__status-text">Stream Offline</span>
              <span className="viewer-page__status-subtext">
                El emisor no está transmitiendo en este momento
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
