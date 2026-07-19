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
 * useBlogComments — Fetch and submit comments for a post, course, or lesson
 * @param {string|object} target - Either postId string or object { postId, courseId, lessonId }
 * @param {string} visitorId
 */
export function useBlogComments(target, visitorId) {
  // Support both string (postId) for backward compatibility and object
  const postId = typeof target === 'string' ? target : target?.postId
  const courseId = typeof target === 'object' ? target?.courseId : null
  const lessonId = typeof target === 'object' ? target?.lessonId : null

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!postId && !courseId && !lessonId) return
    setLoading(true)

    let query = supabase
      .from(TABLES.BLOG_COMMENTS)
      .select('*')
      .eq('is_deleted', false)

    if (postId) {
      query = query.eq('post_id', postId)
    } else if (courseId) {
      query = query.eq('course_id', courseId)
    } else if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (!error && data) {
      setComments(data)
    }
    setLoading(false)
  }, [postId, courseId, lessonId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = async (content) => {
    if ((!postId && !courseId && !lessonId) || !visitorId || !content.trim()) {
      return { success: false, error: 'Invalid input' }
    }

    const alias = generateAlias(visitorId)
    const newComment = {
      visitor_id: visitorId,
      alias,
      content: content.trim()
    }

    if (postId) {
      newComment.post_id = postId
    } else if (courseId) {
      newComment.course_id = courseId
    } else if (lessonId) {
      newComment.lesson_id = lessonId
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
