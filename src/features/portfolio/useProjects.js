import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES, PAGINATION } from '../../lib/constants'

/**
 * useProjects — Fetch published projects (public)
 * @returns {{ projects: Array, loading: boolean, error: string|null, refetch: function }}
 */
export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, slug, title, description, cover_url, tags, featured, repo_url, live_url')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(PAGINATION.PORTFOLIO_PAGE_SIZE)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}

/**
 * useProject — Fetch a single project by slug (public)
 * @param {string} slug
 * @returns {{ project: object|null, loading: boolean, error: string|null }}
 */
export function useProject(slug) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchProject = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    fetchProject()
  }, [slug])

  return { project, loading, error }
}

/**
 * useFeaturedProjects — Fetch featured published projects
 * @param {number} [limit=3]
 */
export function useFeaturedProjects(limit = 3) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, slug, title, description, cover_url, tags, repo_url, live_url')
        .eq('published', true)
        .eq('featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit)

      setProjects(data || [])
      setLoading(false)
    }
    fetch()
  }, [limit])

  return { projects, loading }
}
