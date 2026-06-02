import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES, PAGINATION } from '../../lib/constants'

/**
 * useBlogPosts — Fetch published blog posts (public)
 * @returns {{ posts: Array, loading: boolean, error: string|null, refetch: function }}
 */
export function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .select('id, slug, title, excerpt, cover_url, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(PAGINATION.BLOG_PAGE_SIZE)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts }
}

/**
 * useBlogPost — Fetch a single blog post by slug (public)
 * @param {string} slug
 * @returns {{ post: object|null, loading: boolean, error: string|null }}
 */
export function useBlogPost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from(TABLES.BLOG_POSTS)
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setPost(data)
      }
      setLoading(false)
    }

    fetchPost()
  }, [slug])

  return { post, loading, error }
}
