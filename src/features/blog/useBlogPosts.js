import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES, PAGINATION } from '../../lib/constants'

/**
 * useBlogPosts — Fetch published blog posts with filtering & pagination
 * @param {object} [options]
 * @param {string} [options.tagSlug] — Filter by tag slug
 * @param {string} [options.seriesSlug] — Filter by series slug
 * @param {string} [options.search] — Search query
 * @param {number} [options.page] — Page number (1-indexed)
 * @param {number} [options.pageSize] — Override default page size
 * @returns {{ posts: Array, loading: boolean, error: string|null, totalCount: number, totalPages: number, refetch: function }}
 */
export function useBlogPosts(options = {}) {
  const {
    tagSlug,
    seriesSlug,
    search,
    page = 1,
    pageSize = PAGINATION.BLOG_PAGE_SIZE,
  } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // If filtering by tag, we need to join through blog_post_tags
      if (tagSlug) {
        // First get tag id
        const { data: tag } = await supabase
          .from(TABLES.BLOG_TAGS)
          .select('id')
          .eq('slug', tagSlug)
          .single()

        if (!tag) {
          setPosts([])
          setTotalCount(0)
          setLoading(false)
          return
        }

        // Get post IDs for this tag
        const { data: postTags } = await supabase
          .from(TABLES.BLOG_POST_TAGS)
          .select('post_id')
          .eq('tag_id', tag.id)

        const postIds = (postTags || []).map(pt => pt.post_id)

        if (postIds.length === 0) {
          setPosts([])
          setTotalCount(0)
          setLoading(false)
          return
        }

        // Fetch posts by IDs
        let query = supabase
          .from(TABLES.BLOG_POSTS)
          .select('id, slug, title, excerpt, cover_url, published_at, created_at, reading_time_min, view_count, featured, content_format', { count: 'exact' })
          .eq('published', true)
          .in('id', postIds)
          .order('published_at', { ascending: false })
          .range(from, to)

        if (search) {
          query = query.ilike('title', `%${search}%`)
        }

        const { data, count, error: fetchError } = await query

        if (fetchError) throw fetchError

        // Fetch tags for these posts
        const postsWithTags = await attachTagsToPosts(data || [])
        setPosts(postsWithTags)
        setTotalCount(count || 0)
      } else if (seriesSlug) {
        // Filter by series
        const { data: series } = await supabase
          .from(TABLES.BLOG_SERIES)
          .select('id')
          .eq('slug', seriesSlug)
          .single()

        if (!series) {
          setPosts([])
          setTotalCount(0)
          setLoading(false)
          return
        }

        const { data, count, error: fetchError } = await supabase
          .from(TABLES.BLOG_POSTS)
          .select('id, slug, title, excerpt, cover_url, published_at, created_at, reading_time_min, view_count, featured, content_format, series_order', { count: 'exact' })
          .eq('published', true)
          .eq('series_id', series.id)
          .order('series_order', { ascending: true })
          .range(from, to)

        if (fetchError) throw fetchError

        const postsWithTags = await attachTagsToPosts(data || [])
        setPosts(postsWithTags)
        setTotalCount(count || 0)
      } else {
        // Default: all published posts
        let query = supabase
          .from(TABLES.BLOG_POSTS)
          .select('id, slug, title, excerpt, cover_url, published_at, created_at, reading_time_min, view_count, featured, content_format', { count: 'exact' })
          .eq('published', true)
          .order('published_at', { ascending: false })
          .range(from, to)

        if (search) {
          query = query.ilike('title', `%${search}%`)
        }

        const { data, count, error: fetchError } = await query

        if (fetchError) throw fetchError

        const postsWithTags = await attachTagsToPosts(data || [])
        setPosts(postsWithTags)
        setTotalCount(count || 0)
      }
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }, [page, pageSize, tagSlug, seriesSlug, search])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const totalPages = Math.ceil(totalCount / pageSize)

  return { posts, loading, error, totalCount, totalPages, refetch: fetchPosts }
}

/**
 * useBlogPost — Fetch a single blog post by slug with tags + series data
 * @param {string} slug
 * @returns {{ post: object|null, seriesPosts: Array, relatedPosts: Array, loading: boolean, error: string|null }}
 */
export function useBlogPost(slug) {
  const [post, setPost] = useState(null)
  const [seriesPosts, setSeriesPosts] = useState([])
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch the post
        const { data, error: fetchError } = await supabase
          .from(TABLES.BLOG_POSTS)
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (fetchError) throw fetchError

        // Fetch tags for this post
        const { data: postTags } = await supabase
          .from(TABLES.BLOG_POST_TAGS)
          .select(`tag_id, ${TABLES.BLOG_TAGS} ( id, name, slug, color )`)
          .eq('post_id', data.id)

        data.tags = (postTags || [])
          .map(pt => pt[TABLES.BLOG_TAGS])
          .filter(Boolean)

        // If part of a series, fetch series info + sibling posts
        if (data.series_id) {
          const { data: series } = await supabase
            .from(TABLES.BLOG_SERIES)
            .select('*')
            .eq('id', data.series_id)
            .single()

          data.series = series

          const { data: siblings } = await supabase
            .from(TABLES.BLOG_POSTS)
            .select('id, slug, title, series_order')
            .eq('series_id', data.series_id)
            .eq('published', true)
            .order('series_order', { ascending: true })

          setSeriesPosts(siblings || [])
        }

        // Fetch related posts (by shared tags, excluding current)
        if (data.tags.length > 0) {
          const tagIds = data.tags.map(t => t.id)
          const { data: relatedTagPosts } = await supabase
            .from(TABLES.BLOG_POST_TAGS)
            .select('post_id')
            .in('tag_id', tagIds)
            .neq('post_id', data.id)

          const relatedIds = [...new Set((relatedTagPosts || []).map(r => r.post_id))]

          if (relatedIds.length > 0) {
            const { data: related } = await supabase
              .from(TABLES.BLOG_POSTS)
              .select('id, slug, title, excerpt, cover_url, published_at, reading_time_min')
              .eq('published', true)
              .in('id', relatedIds.slice(0, PAGINATION.BLOG_RELATED_COUNT))
              .order('published_at', { ascending: false })

            setRelatedPosts(related || [])
          }
        }

        // Increment view count (fire and forget)
        supabase
          .from(TABLES.BLOG_POSTS)
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {})

        setPost(data)
      } catch (err) {
        setError(err.message)
      }

      setLoading(false)
    }

    fetchPost()
  }, [slug])

  return { post, seriesPosts, relatedPosts, loading, error }
}

/**
 * Attach tags to an array of posts
 * @param {Array} posts
 * @returns {Promise<Array>}
 */
async function attachTagsToPosts(posts) {
  if (posts.length === 0) return posts

  const postIds = posts.map(p => p.id)

  const { data: postTags } = await supabase
    .from(TABLES.BLOG_POST_TAGS)
    .select(`post_id, ${TABLES.BLOG_TAGS} ( id, name, slug, color )`)
    .in('post_id', postIds)

  const tagMap = {}
  for (const pt of (postTags || [])) {
    if (!tagMap[pt.post_id]) tagMap[pt.post_id] = []
    if (pt[TABLES.BLOG_TAGS]) tagMap[pt.post_id].push(pt[TABLES.BLOG_TAGS])
  }

  return posts.map(p => ({
    ...p,
    tags: tagMap[p.id] || [],
  }))
}
