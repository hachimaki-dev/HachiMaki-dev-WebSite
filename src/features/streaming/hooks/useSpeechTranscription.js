/**
 * useSpeechTranscription.js — Real-time speech-to-text transcription
 *
 * Uses the native browser Web Speech API (SpeechRecognition) for transcribing
 * spoken audio in real-time, and saves final transcript segments to Supabase.
 * Viewers subscribe to updates via Supabase Realtime.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('transcription')

/* Handle Web Speech API vendor prefixing */
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

/**
 * Custom hook for live speech-to-text transcription
 * @param {string} roomId
 * @param {'caster'|'viewer'} role
 * @returns {Object}
 */
export function useSpeechTranscription(roomId, role = 'viewer') {
  const [transcripts, setTranscripts] = useState([])
  const [currentSpeech, setCurrentSpeech] = useState('') // Interim speech
  const [isSupported] = useState(!!SpeechRecognition)
  const [isListening, setIsListening] = useState(false)

  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const subscriptionRef = useRef(null)

  /** Save transcription segment to Supabase (Caster only) */
  const saveTranscript = useCallback(async (text) => {
    if (!roomId || !text.trim()) return

    const { error } = await supabase.from(TABLES.STREAM_TRANSCRIPTIONS).insert({
      room_id: roomId,
      text: text.trim(),
    })

    if (error) {
      log.error('Failed to save transcription:', error.message)
    }
  }, [roomId])

  /** ── Caster Speech Recognition Initialization ── */
  useEffect(() => {
    if (role !== 'caster' || !isSupported || !roomId) return

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'es-ES' // Default to Spanish

    rec.onstart = () => {
      log.info('Speech recognition started')
      setIsListening(true)
      isListeningRef.current = true
    }

    rec.onresult = (event) => {
      let interim = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalChunk += text
        } else {
          interim += text
        }
      }

      if (finalChunk.trim()) {
        log.info('Final speech recognized:', finalChunk)
        saveTranscript(finalChunk)
        setTranscripts((prev) => [...prev, {
          text: finalChunk.trim(),
          created_at: new Date().toISOString()
        }])
      }

      setCurrentSpeech(interim)
    }

    rec.onerror = (event) => {
      log.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        log.error('Microphone access denied for SpeechRecognition')
        setIsListening(false)
        isListeningRef.current = false
      }
    }

    rec.onend = () => {
      log.info('Speech recognition ended')
      /* Auto-restart if we should still be listening (e.g. browser timed out or caster is silent) */
      if (isListeningRef.current) {
        log.info('Auto-restarting speech recognition...')
        try {
          rec.start()
        } catch (err) {
          log.error('Failed to restart speech recognition:', err.message)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = rec

    return () => {
      isListeningRef.current = false
      try {
        rec.stop()
      } catch (err) {
        // ignore
      }
    }
  }, [role, isSupported, roomId, saveTranscript])

  const startTranscription = useCallback(() => {
    if (!isSupported || role !== 'caster' || !recognitionRef.current) return
    isListeningRef.current = true
    try {
      recognitionRef.current.start()
    } catch (err) {
      log.error('Failed to start SpeechRecognition:', err.message)
    }
  }, [isSupported, role])

  const stopTranscription = useCallback(() => {
    if (!isSupported || role !== 'caster' || !recognitionRef.current) return
    isListeningRef.current = false
    try {
      recognitionRef.current.stop()
    } catch (err) {
      log.error('Failed to stop SpeechRecognition:', err.message)
    }
    setIsListening(false)
    setCurrentSpeech('')
  }, [isSupported, role])

  /** ── Viewer Realtime Subscription ── */
  const loadInitialTranscripts = useCallback(async () => {
    if (!roomId) return

    const { data, error } = await supabase
      .from(TABLES.STREAM_TRANSCRIPTIONS)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      log.error('Failed to load transcripts:', error.message)
    } else {
      setTranscripts(data || [])
    }
  }, [roomId])

  useEffect(() => {
    if (role !== 'viewer' || !roomId) return

    loadInitialTranscripts()

    subscriptionRef.current = supabase
      .channel(`transcription:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.STREAM_TRANSCRIPTIONS,
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTranscripts((prev) => {
            const updated = [...prev, payload.new]
            /* Keep at most 100 transcripts in local history */
            if (updated.length > 100) {
              return updated.slice(-100)
            }
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [role, roomId, loadInitialTranscripts])

  return {
    transcripts,
    currentSpeech,
    isSupported,
    isListening,
    startTranscription,
    stopTranscription,
  }
}
