import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useContactAdmin — CRUD hook for contact messages (admin)
 */
export function useContactAdmin() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.CONTACT_MESSAGES)
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const markAsRead = useCallback(async (id, isRead) => {
    const { error: updateError } = await supabase
      .from(TABLES.CONTACT_MESSAGES)
      .update({ is_read: isRead })
      .eq('id', id)

    if (updateError) throw new Error(updateError.message)
    
    // Update local state directly to be responsive
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: isRead } : msg))
  }, [])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.CONTACT_MESSAGES)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    
    // Update local state directly
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  return {
    messages,
    loading,
    error,
    refetch: fetchAll,
    markAsRead,
    remove,
  }
}
