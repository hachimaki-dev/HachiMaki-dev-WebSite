/**
 * useChat.js — Real-time chat for streaming rooms
 *
 * Handles sending, receiving, and subscribing to chat messages
 * via Supabase Realtime.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from '../lib/streamLogger'

const log = createStreamLogger('chat')

/** Max messages to keep in memory */
const MAX_MESSAGES = 5000

/** Max messages to load initially */
const INITIAL_LOAD = 50

/**
 * Hook for real-time chat in a room
 * @param {string} roomId
 * @param {string} senderId - The current user/viewer ID
 * @param {string} [displayName] - Display name for this user
 * @returns {Object}
 */
export function useChat(roomId, senderId, displayName = 'Anon') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const subscriptionRef = useRef(null)

  /** Load initial messages */
  const loadMessages = useCallback(async () => {
    if (!roomId) return

    setLoading(true)

    const { data, error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(INITIAL_LOAD)

    if (error) {
      log.error('Failed to load messages:', error.message)
    } else {
      setMessages(data || [])
    }

    setLoading(false)
  }, [roomId])

  /**
   * Send a chat message
   * @param {string} text
   */
  const sendMessage = useCallback(async (text) => {
    if (!roomId || !text.trim()) return

    const { error } = await supabase.from(TABLES.CHAT_MESSAGES).insert({
      room_id: roomId,
      sender_id: senderId,
      display_name: displayName,
      message: text.trim().substring(0, 500),
    })

    if (error) {
      log.error('Failed to send message:', error.message)
    }
  }, [roomId, senderId, displayName])

  /** Subscribe to new messages via Realtime */
  useEffect(() => {
    if (!roomId) return

    loadMessages()

    subscriptionRef.current = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.CHAT_MESSAGES,
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const updated = [...prev, payload.new]
            /* Trim to max messages */
            if (updated.length > MAX_MESSAGES) {
              return updated.slice(-MAX_MESSAGES)
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
  }, [roomId, loadMessages])

  /**
   * Delete a message (admin only)
   * @param {string} messageId
   */
  const deleteMessage = useCallback(async (messageId) => {
    const { error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .delete()
      .eq('id', messageId)

    if (error) {
      log.error('Failed to delete message:', error.message)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    }
  }, [])

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
  }
}
