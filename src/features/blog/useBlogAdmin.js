import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'
import { calculateReadingTime } from '../../components/blog/ReadingTime'

/**
 * useBlogAdmin — CRUD hook for blog posts (admin) with tags & series support
 */
export function useBlogAdmin() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      // Attach tags to each post
      const postsWithTags = await attachTagsToAdminPosts(data || [])
      setPosts(postsWithTags)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getById = useCallback(async (id) => {
    const { data, error: fetchError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // Fetch tags for this post
    const { data: postTags } = await supabase
      .from(TABLES.BLOG_POST_TAGS)
      .select(`tag_id, ${TABLES.BLOG_TAGS} ( id, name, slug, color )`)
      .eq('post_id', data.id)

    data.tags = (postTags || [])
      .map(pt => pt[TABLES.BLOG_TAGS])
      .filter(Boolean)

    return data
  }, [])

  const create = useCallback(async (post, tagIds = []) => {
    // Auto-calculate reading time
    const reading_time_min = calculateReadingTime(post.content)

    const { data, error: createError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .insert({
        ...post,
        reading_time_min,
        content_format: post.content_format || 'markdown',
        published_at: post.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (createError) throw new Error(createError.message)

    // Save tags
    await syncPostTags(data.id, tagIds)

    await fetchAll()
    return data
  }, [fetchAll])

  const update = useCallback(async (id, updates, tagIds) => {
    // Auto-calculate reading time if content changed
    if (updates.content !== undefined) {
      updates.reading_time_min = calculateReadingTime(updates.content)
    }

    // If publishing for the first time, set published_at
    if (updates.published) {
      const existing = posts.find(p => p.id === id)
      if (existing && !existing.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data, error: updateError } = await supabase
      .from(TABLES.BLOG_POSTS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)

    // Sync tags if provided
    if (tagIds !== undefined) {
      await syncPostTags(id, tagIds)
    }

    await fetchAll()
    return data
  }, [fetchAll, posts])

  const remove = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from(TABLES.BLOG_POSTS)
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

  return {
    posts,
    loading,
    error,
    refetch: fetchAll,
    getById,
    create,
    update,
    remove,
    togglePublished,
  }
}

/**
 * Sync tags for a post: delete existing, insert new
 */
async function syncPostTags(postId, tagIds) {
  // Remove existing tags
  await supabase
    .from(TABLES.BLOG_POST_TAGS)
    .delete()
    .eq('post_id', postId)

  // Insert new tags
  if (tagIds && tagIds.length > 0) {
    const rows = tagIds.map(tagId => ({
      post_id: postId,
      tag_id: tagId,
    }))

    await supabase
      .from(TABLES.BLOG_POST_TAGS)
      .insert(rows)
  }
}

/**
 * Attach tags to admin posts list
 */
async function attachTagsToAdminPosts(posts) {
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
