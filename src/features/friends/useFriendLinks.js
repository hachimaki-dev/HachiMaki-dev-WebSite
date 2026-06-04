/**
 * useFriendLinks.js — Public hook for link exchange showcase
 *
 * Fetches all friendly links sorted by their display order.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

export function useFriendLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabase
        .from(TABLES.FRIEND_LINKS)
        .select('*')
        .order('sort_order', { ascending: true })

      if (dbError) throw dbError
      setLinks(data || [])
    } catch (err) {
      console.error('Error fetching friendly links:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  return {
    links,
    loading,
    error,
    refresh: fetchLinks,
  }
}
