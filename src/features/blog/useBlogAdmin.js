import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useBlogAdmin — CRUD hook for blog posts (admin)
 */
export function useBlogAdmin() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getById = useCallback(async (id) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    return data
  }, [])

  const create = useCallback(async (post) => {
    const { data, error: createError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .insert({
        ...post,
        published_at: post.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates) => {
    // If publishing for the first time, set published_at
    if (updates.published) {
      const existing = posts.find(p => p.id === id)
      if (existing && !existing.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data, error: updateError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    await fetchAll()
    return data
  }, [fetchAll, posts])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    await fetchAll()
  }, [fetchAll])

  const togglePublished = useCallback(async (id, published) => {
    return update(id, {
      published,
      published_at: published ? new Date().toISOString() : null,
    })
  }, [update])

  return {
    posts,
    loading,
    error,
    refetch: fetchAll,
    getById,
    create,
    update,
    remove,
    togglePublished,
  }
}
