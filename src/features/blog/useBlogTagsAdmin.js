import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'
import { slugify } from '../../utils/slugify'

/**
 * useBlogTagsAdmin — CRUD hook for blog tags (admin)
 */
export function useBlogTagsAdmin() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_TAGS)
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTags(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = useCallback(async (tag) => {
    const { data, error: createError } = await supabase
      .from(TABLES.BLOG_TAGS)
      .insert({
        name: tag.name,
        slug: tag.slug || slugify(tag.name),
        color: tag.color || '#8b5cf6',
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from(TABLES.BLOG_TAGS)
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
      .from(TABLES.BLOG_TAGS)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    await fetchAll()
  }, [fetchAll])

  return { tags, loading, error, refetch: fetchAll, create, update, remove }
}
