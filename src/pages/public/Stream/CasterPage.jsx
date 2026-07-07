/**
 * CasterPage.jsx — Broadcast view for the stream caster
 *
 * Allows the admin to select devices, go live, record,
 * and manage the stream with real-time viewer stats.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
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
import { useToast } from '../../../components/ui/Toast'
import './CasterPage.css'
import { useSpeechTranscription } from '../../../features/streaming/hooks/useSpeechTranscription'
import Icon from '../../../components/ui/Icon'

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
  const streamStartTimeRef = useRef(null)

  /* Transmission state */
  const [streamEvents, setStreamEvents] = useState([])
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isCameraDisabled, setIsCameraDisabled] = useState(false)

  /* Hooks */
  const { getRoomBySlug, updateRoomStatus } = useRooms()
  const {
    cameras, microphones, stream,
    error: mediaError, helpMessage,
    getStream, getDisplayStream, stopStream,
  } = useMediaDevices()
  const { isRecording, duration, error: recorderError, startRecording, stopRecording } = useMediaRecorder()
  const { uploading, progress: uploadProgress, error: uploadError, uploadRecording } = useRecordingUpload()
  const { viewerCount, joinRoom } = usePresence(room?.id, 'caster')
  const userId = user?.id || 'caster'
  const { messages, sendMessage, deleteMessage } = useChat(room?.id, userId, 'Caster')
  const { toast } = useToast()

  const {
    transcripts,
    currentSpeech,
    isSupported: isSpeechSupported,
    isListening: isSpeechListening,
    startTranscription,
    stopTranscription,
  } = useSpeechTranscription(room?.id, 'caster')

  /* Warn before closing tab or navigating when streaming or uploading */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isLive || uploading) {
        e.preventDefault()
        e.returnValue = 'Hay una transmisión o subida en progreso. ¿Seguro que quieres salir?'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLive, uploading])


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

  /* ── Transmission Controls ── */
  const toggleMic = useCallback(() => {
    if (!stream) return
    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMicMuted(!audioTrack.enabled)
      log.info(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`)
    }
  }, [stream])

  const toggleCamera = useCallback(() => {
    if (!stream) return
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCameraDisabled(!videoTrack.enabled)
      log.info(`Camera ${videoTrack.enabled ? 'enabled' : 'disabled'}`)
    }
  }, [stream])

  const handleScreenshot = useCallback(() => {
    if (!videoRef.current || !streamStartTimeRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    
    const timestampMs = Date.now() - streamStartTimeRef.current
    const timestampFormatted = formatDuration(timestampMs)
    const eventId = crypto.randomUUID()
    
    setStreamEvents((prev) => [...prev, {
      id: eventId,
      type: 'screenshot',
      timestamp_ms: timestampMs,
      timestamp_formatted: timestampFormatted,
      description: 'Captura de pantalla tomada durante la transmisión'
    }])

    a.download = `screenshot_${room?.slug || 'stream'}_${timestampFormatted.replace(/:/g, '-')}.png`
    a.click()
    toast({ type: 'success', message: 'Captura guardada y registrada en el log.' })
  }, [room, toast])

  const generateTransmissionLog = useCallback(() => {
    if (!streamStartTimeRef.current) return

    const logData = {
      stream_title: room?.title || 'Unknown Stream',
      start_time: new Date(streamStartTimeRef.current).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: duration,
      transcripts: transcripts.map(t => {
        const tTime = new Date(t.created_at).getTime()
        const relativeMs = Math.max(0, tTime - streamStartTimeRef.current)
        return {
          text: t.text,
          timestamp_ms: relativeMs,
          timestamp_formatted: formatDuration(relativeMs)
        }
      }),
      chat_messages: messages.map(m => {
        const mTime = new Date(m.created_at).getTime()
        const relativeMs = Math.max(0, mTime - streamStartTimeRef.current)
        return {
          sender: m.display_name || 'Unknown',
          message: m.message,
          timestamp_ms: relativeMs,
          timestamp_formatted: formatDuration(relativeMs)
        }
      }),
      events: streamEvents
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stream_log_${room?.slug || 'stream'}_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [room, duration, transcripts, messages, streamEvents])

  /* ── Go Live ── */
  const handleGoLive = useCallback(async () => {
    if (!stream || !room) return

    setIsLive(true)
    setStreamEvents([])
    streamStartTimeRef.current = Date.now()
    await updateRoomStatus(room.id, 'live')

    /* Start recording */
    const started = startRecording(stream)
    if (!started) {
      toast({ type: 'warning', message: 'No se pudo iniciar la grabación local de la transmisión.' })
    }

    /* Start speech transcription if supported */
    if (isSpeechSupported) {
      startTranscription()
    }

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

    log.info('<Icon name="circle" /> Stream is LIVE')
  }, [stream, room, user, updateRoomStatus, startRecording, toast, isSpeechSupported, startTranscription])

  /* ── Stop Stream ── */
  const handleStopStream = useCallback(async () => {
    setIsLive(false)

    try {
      generateTransmissionLog()
    } catch (err) {
      log.error('Error generating transmission log:', err)
    }

    let recordingResult = null
    try {
      /* Stop recording and get blob */
      recordingResult = await stopRecording()
    } catch (err) {
      log.error('Error stopping recorder:', err)
    }

    /* Stop speech transcription */
    if (isSpeechSupported) {
      stopTranscription()
    }

    try {
      /* Update room status */
      if (room) {
        await updateRoomStatus(room.id, 'ended')
      }
    } catch (err) {
      log.error('Error updating room status:', err)
    }

    try {
      /* Close all peers */
      peerManagerRef.current?.removeAllPeers()

      /* Cleanup signaling */
      signalingRef.current?.unsubscribe()
      cleanupStopRef.current?.()
      if (room) await cleanupAllMessages(room.id)
    } catch (err) {
      log.error('Error cleaning up streaming connection:', err)
    }

    /* Upload recording */
    if (recordingResult?.blob && room && user) {
      try {
        const result = await uploadRecording({
          blob: recordingResult.blob,
          roomId: room.id,
          casterId: user.id,
          durationMs: recordingResult.durationMs,
          mimeType: recordingResult.mimeType,
        })
        if (result) {
          toast({ type: 'success', message: 'Grabación guardada con éxito en el servidor.' })
        } else {
          toast({ type: 'error', message: 'Error al subir la grabación a la nube.' })
        }
      } catch (err) {
        log.error('Error uploading recording:', err)
        toast({ type: 'error', message: 'Error al subir la grabación a la nube.' })
      }
    } else {
      toast({ type: 'warning', message: 'No se generó ninguna grabación para guardar.' })
    }

    log.info('⬛ Stream ended')
  }, [room, user, stopRecording, updateRoomStatus, uploadRecording, toast, isSpeechSupported, stopTranscription, generateTransmissionLog])

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      peerManagerRef.current?.removeAllPeers()
      signalingRef.current?.unsubscribe()
      cleanupStopRef.current?.()
      stopStream()
    }
  }, [stopStream])

  /* ── Page navigation blocker ── */
  const blocker = useBlocker(
    ({ currentValue, nextLocation }) =>
      (isLive || uploading) && currentValue.url !== nextLocation.url
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const proceed = window.confirm(
        isLive
          ? 'Estás transmitiendo en vivo. Si sales de la página, la transmisión se detendrá y se guardará. ¿Seguro que quieres salir?'
          : 'Se está subiendo la grabación de la transmisión. Si sales ahora, se perderá. ¿Seguro que quieres salir?'
      )
      if (proceed) {
        if (isLive) {
          handleStopStream().finally(() => {
            blocker.proceed()
          })
        } else {
          blocker.proceed()
        }
      } else {
        blocker.reset()
      }
    }
  }, [blocker, isLive, uploading, handleStopStream])

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
            <Icon name="eye" /> {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
          </span>
          {isRecording && (
            <span className="caster-page__rec-indicator">
              <span className="caster-page__rec-dot" />
              REC {formatDuration(duration)}
            </span>
          )}
          {isLive && (
            <span className={`caster-page__speech-badge ${isSpeechSupported ? 'caster-page__speech-badge--supported' : 'caster-page__speech-badge--unsupported'}`}>
              {isSpeechSupported ? (isSpeechListening ? <><Icon name="mic" /> CC ON</> : <><Icon name="mic" /> CC PAUSE</>) : <><Icon name="mic" /> No CC</>}
            </span>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="caster-page__video-area">
        <div className="caster-page__video-wrapper">
          {stream ? (
            <>
              <video
                ref={videoRef}
                className="caster-page__video"
                autoPlay
                playsInline
                muted
              />
              {isLive && isSpeechSupported && isSpeechListening && currentSpeech && (
                <div className="caster-page__captions-overlay">
                  <p className="caster-page__captions-text">{currentSpeech}</p>
                </div>
              )}
            </>
          ) : (
            <div className="caster-page__offline">
              <span className="caster-page__offline-icon"><Icon name="camera" /></span>
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
                <Icon name="camera" /> Preview
              </button>
              <button
                className="caster-page__btn caster-page__btn--screen"
                onClick={handleScreenShare}
              >
                <Icon name="monitor" /> Compartir Pantalla
              </button>
              <button
                className="caster-page__btn caster-page__btn--live"
                onClick={handleGoLive}
                disabled={!stream}
              >
                <Icon name="circle" /> Go Live
              </button>
            </>
          ) : (
            <div className="caster-page__live-actions">
              <button
                className="caster-page__btn"
                onClick={toggleMic}
                title={isMicMuted ? "Activar Micrófono" : "Mutear Micrófono"}
              >
                {isMicMuted ? <><Icon name="mic" /> Unmute</> : <><Icon name="mic" /> Mute</>}
              </button>
              <button
                className="caster-page__btn"
                onClick={toggleCamera}
                title={isCameraDisabled ? "Activar Cámara" : "Desactivar Cámara"}
              >
                {isCameraDisabled ? <><Icon name="camera" /> Cam On</> : <><Icon name="camera" /> Cam Off</>}
              </button>
              <button
                className="caster-page__btn"
                onClick={handleScreenshot}
                title="Tomar Captura"
              >
                <Icon name="image" /> Screenshot
              </button>
              {isSpeechSupported && (
                <button
                  className={`caster-page__btn ${isSpeechListening ? 'caster-page__btn--speech-active' : 'caster-page__btn--speech-inactive'}`}
                  onClick={isSpeechListening ? stopTranscription : startTranscription}
                >
                  {isSpeechListening ? <><Icon name="mic" /> Transcripción: ON</> : <><Icon name="mic" /> Transcripción: OFF</>}
                </button>
              )}
              <button
                className="caster-page__btn caster-page__btn--stop"
                onClick={handleStopStream}
              >
                ⬛ Detener Transmisión
              </button>
            </div>
          )}
        </div>

        {/* Media / Recorder / Upload errors */}
        {(mediaError || helpMessage || recorderError || uploadError) && (
          <div className="caster-page__error">
            {mediaError || helpMessage || recorderError || uploadError}
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
