import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * Generates a hacker-style alias based on visitorId
 * e.g. visitor_id "a1b2c3d4-..." -> "PROXY_A1B2"
 */
const generateAlias = (visitorId) => {
  if (!visitorId) return 'ANON_USER'
  const prefix = ['PROXY', 'GUEST', 'NODE', 'TERM', 'AGENT'][visitorId.charCodeAt(0) % 5]
  const suffix = visitorId.substring(0, 4).toUpperCase()
  return `${prefix}_${suffix}`
}

/**
 * useBlogComments — Fetch and submit comments for a post
 * @param {string} postId
 * @param {string} visitorId
 */
export function useBlogComments(postId, visitorId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!postId) return
    setLoading(true)

    const { data, error } = await supabase
      .from(TABLES.BLOG_COMMENTS)
      .select('*')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setComments(data)
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = async (content) => {
    if (!postId || !visitorId || !content.trim()) return { success: false, error: 'Invalid input' }

    const alias = generateAlias(visitorId)
    const newComment = {
      post_id: postId,
      visitor_id: visitorId,
      alias,
      content: content.trim()
    }

    const { data, error } = await supabase
      .from(TABLES.BLOG_COMMENTS)
      .insert(newComment)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (data) {
      setComments(prev => [...prev, data])
    }

    return { success: true }
  }

  return { comments, loading, addComment, fetchComments, generateAlias }
}
