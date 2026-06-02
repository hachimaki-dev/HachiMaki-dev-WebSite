/**
 * useMediaRecorder.js — Browser-based recording via MediaRecorder API
 *
 * Records the caster's master stream (camera + mic + OBS mix)
 * and produces a single Blob when stopped.
 */

import { useState, useRef, useCallback } from 'react'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('recorder')

/** Preferred MIME types in order of priority */
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

/**
 * Detect the best supported MIME type
 * @returns {string}
 */
function detectMimeType() {
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      log.info('Using MIME type:', mime)
      return mime
    }
  }
  log.warn('No preferred MIME type supported, using browser default')
  return ''
}

/**
 * Hook for recording a MediaStream
 * @returns {Object}
 */
export function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const mimeTypeRef = useRef('')

  /**
   * Start recording a stream
   * @param {MediaStream} stream - The stream to record
   * @returns {boolean} Whether recording started successfully
   */
  const startRecording = useCallback((stream) => {
    if (!stream) {
      setError('No hay stream para grabar.')
      return false
    }

    if (recorderRef.current?.state === 'recording') {
      log.warn('Already recording, ignoring start request')
      return false
    }

    setError(null)
    chunksRef.current = []

    const mimeType = detectMimeType()
    mimeTypeRef.current = mimeType

    try {
      const options = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, options)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          log.debug('Chunk recorded:', event.data.size, 'bytes')
        }
      }

      recorder.onerror = (event) => {
        log.error('MediaRecorder error:', event.error)
        setError(`Error de grabación: ${event.error?.message || 'desconocido'}`)
      }

      recorder.onstop = () => {
        log.info('Recording stopped')
        clearInterval(timerRef.current)
      }

      /* Request data every 1 second to avoid data loss on crash */
      recorder.start(1000)
      recorderRef.current = recorder
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setDuration(0)

      /* Duration timer */
      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current)
      }, 1000)

      log.info('Recording started with MIME:', mimeType || 'default')
      return true
    } catch (err) {
      log.error('Failed to start recording:', err)
      setError(`No se pudo iniciar la grabación: ${err.message}`)
      return false
    }
  }, [])

  /**
   * Stop recording and return the recorded blob
   * @returns {Promise<{blob: Blob, durationMs: number, mimeType: string}|null>}
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current

      if (!recorder || recorder.state === 'inactive') {
        log.warn('No active recording to stop')
        resolve(null)
        return
      }

      clearInterval(timerRef.current)
      const durationMs = Date.now() - startTimeRef.current

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || mimeTypeRef.current || 'video/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })

        log.info(`Recording complete: ${blob.size} bytes, ${durationMs}ms`)

        setIsRecording(false)
        chunksRef.current = []
        recorderRef.current = null

        resolve({ blob, durationMs, mimeType })
      }

      try {
        recorder.stop()
      } catch (err) {
        log.error('Failed to stop MediaRecorder:', err)
        resolve(null)
      }
    })
  }, [])

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
  }
}
