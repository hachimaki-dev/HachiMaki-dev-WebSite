import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'
import { calculateReadingTime } from '../../components/blog/ReadingTime'

export function useCoursesAdmin() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from(TABLES.COURSES)
      .select('*, course_lessons(count)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCourses(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getById = useCallback(async (id) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.COURSES)
      .select('*, course_lessons(*)')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    if (data.course_lessons) {
      data.course_lessons.sort((a, b) => a.sort_order - b.sort_order)
    }
    return data
  }, [])

  const create = useCallback(async (courseData) => {
    const { data, error: createError } = await supabase
      .from(TABLES.COURSES)
      .insert({
        ...courseData,
        published_at: courseData.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates) => {
    if (updates.published) {
      const existing = courses.find(c => c.id === id)
      if (existing && !existing.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data, error: updateError } = await supabase
      .from(TABLES.COURSES)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    await fetchAll()
    return data
  }, [fetchAll, courses])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.COURSES)
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    await fetchAll()
  }, [fetchAll])

  const togglePublished = useCallback(async (id, published) => {
    return update(id, {
      published,
      published_at: published ? new Date().toISOString() : null,
    })
  }, [update])

  // --- Lessons Admin ---

  const getLessonById = useCallback(async (lessonId) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.COURSE_LESSONS)
      .select('*')
      .eq('id', lessonId)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    return data
  }, [])

  const createLesson = useCallback(async (lessonData) => {
    const reading_time_min = calculateReadingTime(lessonData.content)
    
    // Auto increment sort_order
    let order = lessonData.sort_order || 0
    if (!lessonData.sort_order) {
       const { data: latest } = await supabase.from(TABLES.COURSE_LESSONS)
        .select('sort_order').eq('course_id', lessonData.course_id)
        .order('sort_order', { ascending: false }).limit(1).single()
       if (latest) order = latest.sort_order + 1
    }

    const { data, error: createError } = await supabase
      .from(TABLES.COURSE_LESSONS)
      .insert({
        ...lessonData,
        reading_time_min,
        sort_order: order,
        published_at: lessonData.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)
    return data
  }, [])

  const updateLesson = useCallback(async (lessonId, updates) => {
    if (updates.content !== undefined) {
      updates.reading_time_min = calculateReadingTime(updates.content)
    }

    if (updates.published && !updates.published_at) {
      // We don't have existing lesson in state here, but usually it's fine to just set it to now if published_at is null
      const existing = await getLessonById(lessonId)
      if (existing && !existing.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data, error: updateError } = await supabase
      .from(TABLES.COURSE_LESSONS)
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    return data
  }, [getLessonById])

  const removeLesson = useCallback(async (lessonId) => {
    const { error: deleteError } = await supabase
      .from(TABLES.COURSE_LESSONS)
      .delete()
      .eq('id', lessonId)

    if (deleteError) throw new Error(deleteError.message)
  }, [])

  const updateLessonsOrder = useCallback(async (lessonsArray) => {
    // Array of { id, sort_order }
    for (const item of lessonsArray) {
      await supabase
        .from(TABLES.COURSE_LESSONS)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    }
  }, [])

  return {
    courses,
    loading,
    error,
    refetch: fetchAll,
    getById,
    create,
    update,
    remove,
    togglePublished,
    
    // Lessons
    getLessonById,
    createLesson,
    updateLesson,
    removeLesson,
    updateLessonsOrder
  }
}
