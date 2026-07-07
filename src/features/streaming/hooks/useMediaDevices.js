/**
 * useMediaDevices.js — Device enumeration and stream acquisition
 *
 * Handles camera/microphone/virtual-camera enumeration,
 * permission requests, and stream switching.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('media')

/** Human-readable permission error messages */
const PERMISSION_MESSAGES = {
  NotAllowedError:
    'Permiso denegado. Haz clic en el ícono de cámara en la barra de dirección de tu navegador para permitir el acceso.',
  NotFoundError:
    'No se encontró la cámara o micrófono seleccionado. Verifica que esté conectado.',
  NotReadableError:
    'El dispositivo está siendo usado por otra aplicación. Cierra otras apps que usen la cámara o micrófono.',
  OverconstrainedError:
    'La resolución solicitada no es soportada por tu dispositivo. Intenta con una resolución menor.',
  AbortError:
    'La captura de medios fue interrumpida. Intenta de nuevo.',
  SecurityError:
    'Acceso bloqueado por la política de seguridad del navegador. Asegúrate de usar HTTPS.',
}

/**
 * @typedef {Object} MediaDevicesState
 * @property {MediaDeviceInfo[]} cameras
 * @property {MediaDeviceInfo[]} microphones
 * @property {MediaStream|null} stream
 * @property {string|null} error
 * @property {string|null} helpMessage
 * @property {boolean} loading
 * @property {function} enumerateDevices
 * @property {function} getStream
 * @property {function} getDisplayStream
 * @property {function} stopStream
 */

/**
 * Hook for managing media devices and streams
 * @returns {MediaDevicesState}
 */
export function useMediaDevices() {
  const [cameras, setCameras] = useState([])
  const [microphones, setMicrophones] = useState([])
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [helpMessage, setHelpMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const streamRef = useRef(null)

  /** Enumerate available devices */
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      const videoInputs = devices.filter((d) => d.kind === 'videoinput')
      const audioInputs = devices.filter((d) => d.kind === 'audioinput')

      setCameras(videoInputs)
      setMicrophones(audioInputs)
      log.info(`Found ${videoInputs.length} cameras, ${audioInputs.length} mics`)

      return { cameras: videoInputs, microphones: audioInputs }
    } catch (err) {
      log.error('Failed to enumerate devices:', err)
      setError('No se pudieron enumerar los dispositivos de medios.')
      return { cameras: [], microphones: [] }
    }
  }, [])

  /**
   * Get a media stream from camera + microphone
   * @param {string} [videoDeviceId] - Specific camera device ID
   * @param {string} [audioDeviceId] - Specific microphone device ID
   * @param {Object} [videoConstraints] - Additional video constraints
   * @returns {Promise<MediaStream|null>}
   */
  const getStream = useCallback(async (videoDeviceId, audioDeviceId, videoConstraints = {}) => {
    setLoading(true)
    setError(null)
    setHelpMessage(null)

    /* Stop existing stream */
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideo = devices.some((d) => d.kind === 'videoinput')
      const hasAudio = devices.some((d) => d.kind === 'audioinput')

      if (!hasVideo && !hasAudio) {
        throw new Error('NotFoundError') // Trigger the standard error handling
      }

      const constraints = {
        video: hasVideo ? {
          ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {}),
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          ...videoConstraints,
        } : false,
        audio: hasAudio ? {
          ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setLoading(false)
      log.info('Got media stream:', mediaStream.getTracks().map((t) => t.kind).join(', '))

      /* Re-enumerate devices after permission granted (labels become available) */
      await enumerateDevices()

      return mediaStream
    } catch (err) {
      log.error('getUserMedia failed:', err.name, err.message)
      const msg = PERMISSION_MESSAGES[err.name] || `Error al acceder a los medios: ${err.message}`
      setError(msg)
      setHelpMessage(msg)
      setLoading(false)
      return null
    }
  }, [enumerateDevices])

  /**
   * Get a display/screen capture stream (for OBS virtual output, screen share, etc.)
   * @returns {Promise<MediaStream|null>}
   */
  const getDisplayStream = useCallback(async () => {
    setLoading(true)
    setError(null)
    setHelpMessage(null)

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      })

      /* If we already have a camera stream, merge audio from it */
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks()
        audioTracks.forEach((track) => displayStream.addTrack(track))
      }

      streamRef.current = displayStream
      setStream(displayStream)
      setLoading(false)
      log.info('Got display stream')
      return displayStream
    } catch (err) {
      log.error('getDisplayMedia failed:', err.name, err.message)

      if (err.name === 'NotAllowedError') {
        setError('Compartir pantalla fue cancelado o bloqueado por el navegador.')
      } else {
        setError(`Error al capturar pantalla: ${err.message}`)
      }

      setLoading(false)
      return null
    }
  }, [])

  /** Stop all tracks and release the stream */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        log.debug('Stopped track:', track.kind, track.label)
      })
      streamRef.current = null
      setStream(null)
    }
  }, [])

  /* Enumerate devices on mount */
  useEffect(() => {
    enumerateDevices()
  }, [enumerateDevices])

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return {
    cameras,
    microphones,
    stream,
    error,
    helpMessage,
    loading,
    enumerateDevices,
    getStream,
    getDisplayStream,
    stopStream,
  }
}
