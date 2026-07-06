import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'
import { slugify } from '../../utils/slugify'

/**
 * useBlogSeriesAdmin — CRUD hook for blog series (admin)
 */
export function useBlogSeriesAdmin() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_SERIES)
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSeries(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = useCallback(async (item) => {
    const { data, error: createError } = await supabase
      .from(TABLES.BLOG_SERIES)
      .insert({
        title: item.title,
        slug: item.slug || slugify(item.title),
        description: item.description || null,
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from(TABLES.BLOG_SERIES)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.BLOG_SERIES)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    await fetchAll()
  }, [fetchAll])

  return { series, loading, error, refetch: fetchAll, create, update, remove }
}
