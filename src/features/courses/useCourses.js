import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from(TABLES.COURSES)
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCourses(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const getCourseBySlug = useCallback(async (slug) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.COURSES)
      .select('*, course_lessons(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    
    // Sort lessons manually as Supabase JS relation sorting can be tricky inline sometimes
    if (data.course_lessons) {
      data.course_lessons = data.course_lessons
        .filter(lesson => lesson.published)
        .sort((a, b) => a.sort_order - b.sort_order)
    }
    return data
  }, [])

  const getLessonBySlug = useCallback(async (courseSlug, lessonSlug) => {
    const [
      { data: course, error: courseError },
      { data: lesson, error: lessonError },
      { data: allLessons, error: allLessonsError }
    ] = await Promise.all([
      supabase.from(TABLES.COURSES).select('id, title, slug').eq('slug', courseSlug).eq('published', true).single(),
      supabase.from(TABLES.COURSE_LESSONS).select('*, courses!inner(slug)').eq('slug', lessonSlug).eq('courses.slug', courseSlug).eq('published', true).single(),
      supabase.from(TABLES.COURSE_LESSONS).select('id, slug, title, sort_order, courses!inner(slug)').eq('courses.slug', courseSlug).eq('published', true).order('sort_order', { ascending: true })
    ])

    if (courseError) throw new Error(courseError.message)
    if (lessonError) throw new Error(lessonError.message)
    if (allLessonsError) throw new Error(allLessonsError.message)

    const currentIndex = allLessons.findIndex(l => l.id === lesson.id)
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

    return { course, lesson, prevLesson, nextLesson, allLessons }
  }, [])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    getCourseBySlug,
    getLessonBySlug
  }
}
