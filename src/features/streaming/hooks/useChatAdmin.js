/**
 * useChatAdmin.js — Admin hook for managing chat history
 *
 * Allows loading the full history of a room's chat and clearing it.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'

export function useChatAdmin() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load full chat history for a room
   * @param {string} roomId
   */
  const loadChatHistory = useCallback(async (roomId) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setMessages([])
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [])

  /**
   * Delete a single message
   * @param {string} messageId
   */
  const deleteMessage = useCallback(async (messageId) => {
    const { error: delError } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .delete()
      .eq('id', messageId)

    if (!delError) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    }
    return !delError
  }, [])

  /**
   * Clear all chat messages for a room
   * @param {string} roomId
   */
  const clearChatHistory = useCallback(async (roomId) => {
    const { error: clearError } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .delete()
      .eq('room_id', roomId)

    if (clearError) {
      setError(clearError.message)
      return false
    }

    setMessages([])
    return true
  }, [])

  return {
    messages,
    loading,
    error,
    loadChatHistory,
    deleteMessage,
    clearChatHistory,
  }
}
