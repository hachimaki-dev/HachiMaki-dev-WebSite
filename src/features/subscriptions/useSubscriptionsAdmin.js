import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useSubscriptionsAdmin — CRUD hook for newsletter subscribers (admin)
 */
export function useSubscriptionsAdmin() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.SUBSCRIPTIONS)
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSubscribers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const updatePreferences = useCallback(async (id, preferences) => {
    const { error: updateError } = await supabase
      .from(TABLES.SUBSCRIPTIONS)
      .update(preferences)
      .eq('id', id)

    if (updateError) throw new Error(updateError.message)
    
    setSubscribers(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, ...preferences } : sub))
    )
  }, [])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.SUBSCRIPTIONS)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    
    setSubscribers(prev => prev.filter(sub => sub.id !== id))
  }, [])

  return {
    subscribers,
    loading,
    error,
    refetch: fetchAll,
    updatePreferences,
    remove,
  }
}
