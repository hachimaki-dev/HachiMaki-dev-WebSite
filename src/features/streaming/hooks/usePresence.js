/**
 * usePresence.js — Real-time presence tracking in rooms
 *
 * Manages viewer join/leave, viewer count via Supabase Realtime,
 * and cleanup on unmount / beforeunload.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('presence')

/**
 * Generate a persistent anonymous ID for this browser session
 * @returns {string}
 */
function getOrCreateViewerId() {
  const KEY = 'hachimaki_viewer_id'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(KEY, id)
  }
  return id
}

/**
 * Hook for room presence management
 * @param {string} roomId - The room UUID
 * @param {'caster'|'viewer'} role
 * @returns {Object}
 */
export function usePresence(roomId, role = 'viewer') {
  const [viewerCount, setViewerCount] = useState(0)
  const [isJoined, setIsJoined] = useState(false)
  const userIdRef = useRef(null)
  const subscriptionRef = useRef(null)

  /** Get the user ID (auth user or anonymous) */
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || getOrCreateViewerId()
  }, [])

  /** Join the room */
  const joinRoom = useCallback(async () => {
    if (!roomId) return

    const userId = await getUserId()
    userIdRef.current = userId

    const { error } = await supabase
      .from(TABLES.ROOM_MEMBERS)
      .upsert(
        {
          room_id: roomId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString(),
          left_at: null,
        },
        { onConflict: 'room_id,user_id' }
      )

    if (error) {
      log.error('Failed to join room:', error.message)
      return
    }

    setIsJoined(true)
    log.info(`Joined room ${roomId} as ${role}`)

    /* Update viewer count */
    await updateViewerCount()
  }, [roomId, role, getUserId])

  /** Leave the room */
  const leaveRoom = useCallback(async () => {
    if (!roomId || !userIdRef.current) return

    const { error } = await supabase
      .from(TABLES.ROOM_MEMBERS)
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', userIdRef.current)

    if (error) {
      log.warn('Failed to leave room:', error.message)
    }

    setIsJoined(false)
    log.info(`Left room ${roomId}`)

    /* Update viewer count */
    await updateViewerCount()
  }, [roomId])

  /** Count active viewers (not left) */
  const updateViewerCount = useCallback(async () => {
    if (!roomId) return

    const { count, error } = await supabase
      .from(TABLES.ROOM_MEMBERS)
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('role', 'viewer')
      .is('left_at', null)

    if (error) {
      log.warn('Failed to count viewers:', error.message)
      return
    }

    setViewerCount(count || 0)

    /* Sync count to stream_state */
    await supabase
      .from(TABLES.STREAM_STATE)
      .update({ viewer_count: count || 0 })
      .eq('room_id', roomId)
  }, [roomId])

  /** Subscribe to viewer count changes via Realtime */
  useEffect(() => {
    if (!roomId) return

    subscriptionRef.current = supabase
      .channel(`presence:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.ROOM_MEMBERS,
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          updateViewerCount()
        }
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [roomId, updateViewerCount])

  /** Cleanup on unmount and beforeunload */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && userIdRef.current) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${TABLES.ROOM_MEMBERS}?room_id=eq.${roomId}&user_id=eq.${userIdRef.current}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ left_at: new Date().toISOString() }),
          keepalive: true
        });
        log.debug('Sent leave beacon via keepalive fetch')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      leaveRoom()
    }
  }, [roomId, leaveRoom])

  return {
    viewerCount,
    isJoined,
    joinRoom,
    leaveRoom,
    userId: userIdRef.current,
    getOrCreateViewerId,
  }
}
