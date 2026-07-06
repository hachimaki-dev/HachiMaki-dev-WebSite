import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useBlogSeries — Fetch a single series by slug with its posts
 * @param {string} slug
 * @returns {{ series: object|null, loading: boolean, error: string|null }}
 */
export function useBlogSeries(slug) {
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchSeries = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from(TABLES.BLOG_SERIES)
          .select('*')
          .eq('slug', slug)
          .single()

        if (fetchError) throw fetchError
        setSeries(data)
      } catch (err) {
        setError(err.message)
      }

      setLoading(false)
    }

    fetchSeries()
  }, [slug])

  return { series, loading, error }
}
