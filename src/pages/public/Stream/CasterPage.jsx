/**
 * CasterPage.jsx — Broadcast view for the stream caster
 *
 * Allows the admin to select devices, go live, record,
 * and manage the stream with real-time viewer stats.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../features/auth/useAuth'
import { useMediaDevices } from '../../../features/streaming/hooks/useMediaDevices'
import { useMediaRecorder } from '../../../features/streaming/hooks/useMediaRecorder'
import { useRooms } from '../../../features/streaming/hooks/useRooms'
import { usePresence } from '../../../features/streaming/hooks/usePresence'
import { useRecordingUpload } from '../../../features/streaming/hooks/useRecordingUpload'
import { useChat } from '../../../features/streaming/hooks/useChat'
import { createSignalingChannel } from '../../../features/streaming/lib/signalingChannel'
import { createPeerManager } from '../../../features/streaming/lib/peerManager'
import { startPeriodicCleanup, cleanupAllMessages } from '../../../features/streaming/lib/signalingCleanup'
import { createStreamLogger } from '../../../features/streaming/lib/streamLogger'
import { StreamChat } from './StreamChat'
import { PageLoader } from '../../../components/ui/PageLoader'
import './CasterPage.css'

const log = createStreamLogger('CasterPage')

/**
 * Format milliseconds to mm:ss or hh:mm:ss
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n) => String(n).padStart(2, '0')

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(minutes)}:${pad(seconds)}`
}

export function CasterPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  /* Room state */
  const [room, setRoom] = useState(null)
  const [roomLoading, setRoomLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [pageError, setPageError] = useState(null)

  /* Refs for non-react state */
  const signalingRef = useRef(null)
  const peerManagerRef = useRef(null)
  const cleanupStopRef = useRef(null)

  /* Hooks */
  const { getRoomBySlug, updateRoomStatus } = useRooms()
  const {
    cameras, microphones, stream,
    error: mediaError, helpMessage,
    getStream, getDisplayStream, stopStream,
  } = useMediaDevices()
  const { isRecording, duration, startRecording, stopRecording } = useMediaRecorder()
  const { uploading, progress: uploadProgress, uploadRecording } = useRecordingUpload()
  const { viewerCount, joinRoom } = usePresence(room?.id, 'caster')
  const userId = user?.id || 'caster'
  const { messages, sendMessage, deleteMessage } = useChat(room?.id, userId, 'Caster')

  /* Device selection state */
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMic, setSelectedMic] = useState('')

  const videoRef = useRef(null)

  /* ── Load room ── */
  useEffect(() => {
    async function loadRoom() {
      const r = await getRoomBySlug(slug)
      if (!r) {
        setPageError('Sala no encontrada.')
      } else if (r.caster_id !== user?.id) {
        setPageError('No tienes permiso para emitir en esta sala.')
      } else {
        setRoom(r)
      }
      setRoomLoading(false)
    }

    if (slug && user) loadRoom()
  }, [slug, user, getRoomBySlug])

  /* ── Join room as caster ── */
  useEffect(() => {
    if (room?.id) joinRoom()
  }, [room?.id, joinRoom])

  /* ── Attach stream to video element ── */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  /* ── Preview: get camera stream ── */
  const handlePreview = useCallback(async () => {
    await getStream(selectedCamera || undefined, selectedMic || undefined)
  }, [getStream, selectedCamera, selectedMic])

  /* ── Screen share ── */
  const handleScreenShare = useCallback(async () => {
    await getDisplayStream()
  }, [getDisplayStream])

  /* ── Go Live ── */
  const handleGoLive = useCallback(async () => {
    if (!stream || !room) return

    setIsLive(true)
    await updateRoomStatus(room.id, 'live')

    /* Start recording */
    startRecording(stream)

    /* Set up signaling */
    const signaling = createSignalingChannel(room.id, user.id)
    signalingRef.current = signaling

    /* Set up peer manager */
    const manager = createPeerManager({
      localStream: stream,
      onOffer: (viewerId, offer) => {
        signaling.sendOffer(viewerId, offer)
      },
      onIceCandidate: (viewerId, candidate) => {
        signaling.sendIceCandidate(viewerId, candidate)
      },
      onViewerConnected: (viewerId) => {
        log.info('Viewer connected:', viewerId)
      },
      onViewerDisconnected: (viewerId) => {
        log.info('Viewer disconnected:', viewerId)
      },
    })
    peerManagerRef.current = manager

    /* Subscribe to signaling messages */
    await signaling.subscribe((msg) => {
      switch (msg.type) {
        case 'viewer-ready':
          manager.createPeerForViewer(msg.sender_id)
          break
        case 'answer':
          manager.handleAnswer(msg.sender_id, msg.payload.sdp)
          break
        case 'ice-candidate':
          manager.handleIceCandidate(msg.sender_id, msg.payload.candidate)
          break
      }
    }).catch(err => {
      log.error('Failed to subscribe caster to signaling:', err)
      setPageError('Error de red: No se pudo conectar al canal de señalización.')
    })

    /* Start periodic signaling cleanup */
    cleanupStopRef.current = startPeriodicCleanup(room.id)

    log.info('🔴 Stream is LIVE')
  }, [stream, room, user, updateRoomStatus, startRecording])

  /* ── Stop Stream ── */
  const handleStopStream = useCallback(async () => {
    setIsLive(false)

    /* Stop recording and get blob */
    const recordingResult = await stopRecording()

    /* Update room status */
    if (room) {
      await updateRoomStatus(room.id, 'ended')
    }

    /* Close all peers */
    peerManagerRef.current?.removeAllPeers()

    /* Cleanup signaling */
    signalingRef.current?.unsubscribe()
    cleanupStopRef.current?.()
    if (room) await cleanupAllMessages(room.id)

    /* Upload recording */
    if (recordingResult?.blob && room && user) {
      await uploadRecording({
        blob: recordingResult.blob,
        roomId: room.id,
        casterId: user.id,
        durationMs: recordingResult.durationMs,
        mimeType: recordingResult.mimeType,
      })
    }

    log.info('⬛ Stream ended')
  }, [room, user, stopRecording, updateRoomStatus, uploadRecording])

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      peerManagerRef.current?.removeAllPeers()
      signalingRef.current?.unsubscribe()
      cleanupStopRef.current?.()
      stopStream()
    }
  }, [stopStream])

  /* ── Render guards ── */
  if (authLoading || roomLoading) return <PageLoader />
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }
  if (pageError) {
    return (
      <div className="caster-page">
        <div className="caster-page__error">{pageError}</div>
      </div>
    )
  }

  return (
    <div className="caster-page">
      {/* Top bar */}
      <div className="caster-page__topbar">
        <h1 className="caster-page__title">
          {isLive && <span className="caster-page__live-badge">LIVE</span>}
          {room?.title || 'Stream'}
        </h1>
        <div className="caster-page__topbar-actions">
          <span className="caster-page__stat caster-page__stat--viewers">
            👁 {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
          </span>
          {isRecording && (
            <span className="caster-page__rec-indicator">
              <span className="caster-page__rec-dot" />
              REC {formatDuration(duration)}
            </span>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="caster-page__video-area">
        <div className="caster-page__video-wrapper">
          {stream ? (
            <video
              ref={videoRef}
              className="caster-page__video"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="caster-page__offline">
              <span className="caster-page__offline-icon">📷</span>
              <p>Selecciona dispositivos y haz clic en &quot;Preview&quot; para comenzar</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="caster-page__controls">
          {/* Device selectors */}
          <div className="caster-page__device-selectors">
            <div className="caster-page__select-group">
              <span className="caster-page__select-label">Cámara</span>
              <select
                className="caster-page__select"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isLive}
              >
                <option value="">Default</option>
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="caster-page__select-group">
              <span className="caster-page__select-label">Micrófono</span>
              <select
                className="caster-page__select"
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                disabled={isLive}
              >
                <option value="">Default</option>
                {microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Mic ${mic.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          {!isLive ? (
            <>
              <button
                className="caster-page__btn caster-page__btn--preview"
                onClick={handlePreview}
              >
                📷 Preview
              </button>
              <button
                className="caster-page__btn caster-page__btn--screen"
                onClick={handleScreenShare}
              >
                🖥 Compartir Pantalla
              </button>
              <button
                className="caster-page__btn caster-page__btn--live"
                onClick={handleGoLive}
                disabled={!stream}
              >
                🔴 Go Live
              </button>
            </>
          ) : (
            <button
              className="caster-page__btn caster-page__btn--stop"
              onClick={handleStopStream}
            >
              ⬛ Detener Transmisión
            </button>
          )}
        </div>

        {/* Media error */}
        {(mediaError || helpMessage) && (
          <div className="caster-page__error">
            {mediaError || helpMessage}
          </div>
        )}
      </div>

      {/* Chat sidebar */}
      <div className="caster-page__sidebar">
        <StreamChat
          messages={messages}
          onSend={sendMessage}
          onDelete={deleteMessage}
          isAdmin
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="caster-page__upload-banner">
          <span>Subiendo grabación…</span>
          <div className="caster-page__upload-progress">
            <div
              className="caster-page__upload-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}
    </div>
  )
}
