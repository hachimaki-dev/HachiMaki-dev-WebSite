/**
 * useRooms.js — Room CRUD and state management
 *
 * Handles creating, listing, updating, and deleting streaming rooms.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('rooms')

/**
 * Generate a URL-safe slug from a title
 * @param {string} title
 * @returns {string}
 */
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}

/**
 * Hook for room CRUD operations
 * @returns {Object}
 */
export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /** Fetch all rooms for the current user */
  const listRooms = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.ROOMS)
      .select('*, stream_state(*), recordings(id)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      log.error('Failed to list rooms:', fetchError.message)
      setError(fetchError.message)
      setLoading(false)
      return []
    }

    setRooms(data || [])
    setLoading(false)
    return data || []
  }, [])

  /**
   * Create a new room
   * @param {string} title
   * @param {string} [password]
   * @returns {Promise<Object|null>}
   */
  const createRoom = useCallback(async (title, password = '') => {
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Debes estar autenticado para crear una sala.')
      return null
    }

    const slug = generateSlug(title)

    const is_private = Boolean(password && password.trim())

    const { data: room, error: insertError } = await supabase
      .from(TABLES.ROOMS)
      .insert({ title, slug, caster_id: user.id, is_private })
      .select()
      .single()

    if (insertError) {
      log.error('Failed to create room:', insertError.message)
      setError(insertError.message)
      return null
    }

    /* Create password entry if private */
    if (is_private) {
      const { error: pwdError } = await supabase
        .from('room_passwords')
        .insert({ room_id: room.id, password: password.trim() })
      
      if (pwdError) {
        log.error('Failed to set room password:', pwdError.message)
        // Cleanup room if password fails
        await supabase.from(TABLES.ROOMS).delete().eq('id', room.id)
        setError('Error al configurar la contraseña de la sala.')
        return null
      }
    }

    /* Create initial stream state */
    const { error: stateError } = await supabase
      .from(TABLES.STREAM_STATE)
      .insert({ room_id: room.id })

    if (stateError) {
      log.warn('Failed to create stream state:', stateError.message)
    }

    log.info('Created room:', room.slug)
    return room
  }, [])

  /**
   * Get a room by slug
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  const getRoomBySlug = useCallback(async (slug) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.ROOMS)
      .select('*, stream_state(*)')
      .eq('slug', slug)
      .single()

    if (fetchError) {
      log.error('Failed to get room:', fetchError.message)
      return null
    }

    return data
  }, [])

  /**
   * Update room status
   * @param {string} roomId
   * @param {'offline'|'live'|'ended'} status
   */
  const updateRoomStatus = useCallback(async (roomId, status) => {
    const updates = { status }

    if (status === 'live') updates.started_at = new Date().toISOString()
    if (status === 'ended' || status === 'offline') updates.ended_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from(TABLES.ROOMS)
      .update(updates)
      .eq('id', roomId)

    if (updateError) {
      log.error('Failed to update room status:', updateError.message)
      return false
    }

    /* Update stream state */
    await supabase
      .from(TABLES.STREAM_STATE)
      .update({
        is_live: status === 'live',
        viewer_count: status === 'live' ? undefined : 0,
      })
      .eq('room_id', roomId)

    log.info(`Room ${roomId} status → ${status}`)
    return true
  }, [])

  /**
   * Delete a room
   * @param {string} roomId
   */
  const deleteRoom = useCallback(async (roomId) => {
    const { error: deleteError } = await supabase
      .from(TABLES.ROOMS)
      .delete()
      .eq('id', roomId)

    if (deleteError) {
      log.error('Failed to delete room:', deleteError.message)
      setError(deleteError.message)
      return false
    }

    setRooms((prev) => prev.filter((r) => r.id !== roomId))
    log.info('Deleted room:', roomId)
    return true
  }, [])

  /**
   * Delete a recording (Storage + DB)
   * @param {string} recordingId
   * @param {string} filePath
   */
  const deleteRecording = useCallback(async (recordingId, filePath) => {
    /* 1. Delete from Storage */
    const { error: storageError } = await supabase.storage
      .from('recordings')
      .remove([filePath])

    if (storageError) {
      log.error('Failed to delete recording file:', storageError.message)
      // We continue to delete from DB even if storage fails, just in case it's orphaned
    }

    /* 2. Delete from DB */
    const { error: dbError } = await supabase
      .from(TABLES.RECORDINGS)
      .delete()
      .eq('id', recordingId)

    if (dbError) {
      log.error('Failed to delete recording record:', dbError.message)
      return false
    }

    log.info('Deleted recording:', recordingId)
    return true
  }, [])

  /**
   * Garbage Collector: Delete recordings older than 7 days
   * Removes from storage and DB
   * @returns {Promise<number>} Number of recordings deleted
   */
  const cleanupExpiredRecordings = useCallback(async () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: expired, error: fetchError } = await supabase
      .from(TABLES.RECORDINGS)
      .select('id, file_path')
      .lt('created_at', sevenDaysAgo.toISOString())

    if (fetchError) {
      log.error('Failed to fetch expired recordings:', fetchError.message)
      return 0
    }

    if (!expired || expired.length === 0) {
      return 0
    }

    let deletedCount = 0
    for (const rec of expired) {
      const ok = await deleteRecording(rec.id, rec.file_path)
      if (ok) deletedCount++
    }

    if (deletedCount > 0) {
      log.info(`Garbage Collector: Deleted ${deletedCount} expired recordings.`)
    }
    return deletedCount
  }, [deleteRecording])

  return {
    rooms,
    loading,
    error,
    listRooms,
    createRoom,
    getRoomBySlug,
    updateRoomStatus,
    deleteRoom,
    deleteRecording,
    cleanupExpiredRecordings,
  }
}
