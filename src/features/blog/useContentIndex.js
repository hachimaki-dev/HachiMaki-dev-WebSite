import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useContentIndex — Fetches published blog posts and courses/lessons combined and sorted.
 * 
 * @returns {{ items: Array, loading: boolean, error: string|null, refetch: function }}
 */
export function useContentIndex() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIndex = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Blog Posts
      const { data: postsData, error: postsError } = await supabase
        .from(TABLES.BLOG_POSTS)
        .select('id, title, slug, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (postsError) throw postsError

      // 2. Fetch Courses
      const { data: coursesData, error: coursesError } = await supabase
        .from(TABLES.COURSES)
        .select('id, title, slug, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (coursesError) throw coursesError

      // 3. Fetch Lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from(TABLES.COURSE_LESSONS)
        .select('id, course_id, title, slug, sort_order')
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (lessonsError) throw lessonsError

      // 4. Map & Combine
      const mappedPosts = (postsData || []).map(p => ({
        id: `blog-${p.id}`,
        type: 'blog',
        title: p.title,
        slug: p.slug,
        published_at: p.published_at,
        link: `/blog/${p.slug}`
      }))

      const mappedCourses = (coursesData || []).map(c => {
        const courseLessons = (lessonsData || [])
          .filter(l => l.course_id === c.id)
          .map(l => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            link: `/cursos/${c.slug}/${l.slug}`
          }))

        return {
          id: `course-${c.id}`,
          type: 'course',
          title: c.title,
          slug: c.slug,
          published_at: c.published_at,
          link: `/cursos/${c.slug}`,
          lessons: courseLessons
        }
      })

      const combined = [...mappedPosts, ...mappedCourses]
      combined.sort((a, b) => {
        const dateA = new Date(a.published_at).getTime()
        const dateB = new Date(b.published_at).getTime()
        return dateB - dateA
      })

      setItems(combined)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndex()
  }, [fetchIndex])

  return { items, loading, error, refetch: fetchIndex }
}
