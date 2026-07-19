import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

export function useUnifiedFeed({ search = '', tagSlug = null, limit = 50 } = {}) {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUnifiedFeed = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Blog Posts
      let postsQuery = supabase
        .from(TABLES.BLOG_POSTS)
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)
      
      if (search) {
        postsQuery = postsQuery.ilike('title', `%${search}%`)
      }
      
      // 2. Fetch Courses
      let coursesQuery = supabase
        .from(TABLES.COURSES)
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (search) {
        coursesQuery = coursesQuery.ilike('title', `%${search}%`)
      }

      // 3. Fetch Course Lessons (with course info for linking)
      let lessonsQuery = supabase
        .from(TABLES.COURSE_LESSONS)
        .select('*, course:course_id(title, slug)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (search) {
        lessonsQuery = lessonsQuery.ilike('title', `%${search}%`)
      }
      
      const [
        { data: postsData, error: postsError },
        { data: coursesData, error: coursesError },
        { data: lessonsData, error: lessonsError }
      ] = await Promise.all([
        postsQuery,
        coursesQuery,
        lessonsQuery
      ])

      if (postsError) throw postsError
      if (coursesError) throw coursesError
      if (lessonsError) throw lessonsError

      // 4. Map and Merge
      const mappedPosts = (postsData || []).map(p => ({
        ...p,
        feed_type: 'BLOG',
        feed_id: `blog-${p.id}`,
        link: `/blog/${p.slug}`,
        feed_badge: 'SEÑAL'
      }))

      const mappedCourses = (coursesData || []).map(c => ({
        ...c,
        feed_type: 'COURSE',
        feed_id: `course-${c.id}`,
        link: `/cursos/${c.slug}`,
        feed_badge: 'CURSO'
      }))

      const mappedLessons = (lessonsData || []).map(l => ({
        ...l,
        feed_type: 'LESSON',
        feed_id: `lesson-${l.id}`,
        link: `/cursos/${l.course?.slug}/${l.slug}`,
        feed_badge: 'LECCIÓN',
        title: `${l.course?.title}: ${l.title}` // Prefix with course title
      }))

      // Combine all and sort by published_at DESC
      let combined = [...mappedPosts, ...mappedCourses, ...mappedLessons]
      combined.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime()
        const dateB = new Date(b.published_at || b.created_at).getTime()
        return dateB - dateA
      })

      // If we are filtering by a blog tag, we only keep blog posts for now
      // (Unless we add tags to courses in the future)
      if (tagSlug) {
        // Need to filter posts by tag. This is basic, might not include tag info 
        // since we didn't fetch tags above. We'll skip tag filtering for now in unified hook 
        // or just ignore tags for courses.
        // For accurate tag filtering, it's better to stick to useBlogPosts for the BlogPage
      }

      setFeed(combined.slice(0, limit))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, limit, tagSlug])

  useEffect(() => {
    fetchUnifiedFeed()
  }, [fetchUnifiedFeed])

  return {
    feed,
    loading,
    error,
    refetch: fetchUnifiedFeed
  }
}
