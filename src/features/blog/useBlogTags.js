import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useBlogTags — Fetch all blog tags with post count
 * @returns {{ tags: Array, loading: boolean, error: string|null }}
 */
export function useBlogTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all tags
        const { data: allTags, error: tagsError } = await supabase
          .from(TABLES.BLOG_TAGS)
          .select('*')
          .order('name', { ascending: true })

        if (tagsError) throw tagsError

        // Fetch post counts per tag
        const { data: postTags } = await supabase
          .from(TABLES.BLOG_POST_TAGS)
          .select('tag_id')

        const countMap = {}
        for (const pt of (postTags || [])) {
          countMap[pt.tag_id] = (countMap[pt.tag_id] || 0) + 1
        }

        const tagsWithCount = (allTags || []).map(tag => ({
          ...tag,
          postCount: countMap[tag.id] || 0,
        }))

        setTags(tagsWithCount)
      } catch (err) {
        setError(err.message)
      }

      setLoading(false)
    }

    fetchTags()
  }, [])

  return { tags, loading, error }
}

/**
 * useBlogTag — Fetch a single tag by slug
 * @param {string} slug
 * @returns {{ tag: object|null, loading: boolean, error: string|null }}
 */
export function useBlogTag(slug) {
  const [tag, setTag] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchTag = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from(TABLES.BLOG_TAGS)
        .select('*')
        .eq('slug', slug)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setTag(data)
      }
      setLoading(false)
    }

    fetchTag()
  }, [slug])

  return { tag, loading, error }
}
