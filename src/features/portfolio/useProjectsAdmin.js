import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useProjectsAdmin — CRUD hook for projects (admin)
 */
export function useProjectsAdmin() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .order('sort_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getById = useCallback(async (id) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    return data
  }, [])

  const create = useCallback(async (project) => {
    const { data, error: createError } = await supabase
      .from(TABLES.PROJECTS)
      .insert(project)
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from(TABLES.PROJECTS)
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
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    await fetchAll()
  }, [fetchAll])

  const togglePublished = useCallback(async (id, published) => {
    return update(id, { published })
  }, [update])

  const toggleFeatured = useCallback(async (id, featured) => {
    return update(id, { featured })
  }, [update])

  return {
    projects,
    loading,
    error,
    refetch: fetchAll,
    getById,
    create,
    update,
    remove,
    togglePublished,
    toggleFeatured,
  }
}
