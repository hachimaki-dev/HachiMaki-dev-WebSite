/**
 * useRecordingUpload.js — Upload recordings to Supabase Storage
 *
 * Handles uploading the recorded Blob to the `recordings` bucket
 * and creating a metadata entry in the recordings table.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('upload')

/** Storage bucket name */
const BUCKET = 'recordings'

/**
 * Hook for uploading recorded streams
 * @returns {Object}
 */
export function useRecordingUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  /**
   * Upload a recording blob to Supabase Storage
   * @param {Object} params
   * @param {Blob} params.blob - The recorded video blob
   * @param {string} params.roomId - Room UUID
   * @param {string} params.casterId - Caster user UUID
   * @param {number} params.durationMs - Recording duration in ms
   * @param {string} params.mimeType - MIME type of the recording
   * @returns {Promise<Object|null>} The recording metadata or null on error
   */
  const uploadRecording = useCallback(async ({ blob, roomId, casterId, durationMs, mimeType }) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ext = mimeType?.includes('mp4') ? 'mp4' : 'webm'
    const filePath = `${casterId}/${roomId}/${timestamp}.${ext}`

    try {
      /* Upload to Storage */
      log.info(`Uploading recording: ${filePath} (${(blob.size / 1024 / 1024).toFixed(1)}MB)`)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType: mimeType || 'video/webm',
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      setProgress(80)

      /* Get the public URL */
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

      /* Insert metadata into recordings table */
      const { data: recording, error: insertError } = await supabase
        .from(TABLES.RECORDINGS)
        .insert({
          room_id: roomId,
          caster_id: casterId,
          file_path: filePath,
          file_size: blob.size,
          duration_ms: durationMs,
          mime_type: mimeType || 'video/webm',
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setProgress(100)
      setUploading(false)

      log.info('Recording uploaded successfully:', recording.id)

      return {
        ...recording,
        publicUrl: urlData?.publicUrl,
      }
    } catch (err) {
      log.error('Upload failed:', err.message)
      setError(`Error al subir la grabación: ${err.message}`)
      setUploading(false)
      return null
    }
  }, [])

  return {
    uploading,
    progress,
    error,
    uploadRecording,
  }
}
