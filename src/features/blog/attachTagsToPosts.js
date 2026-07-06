import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * attachTagsToPosts — Fetch and attach tags to an array of blog posts.
 *
 * Shared between useBlogPosts (public) and useBlogAdmin (admin CRUD).
 * Performs a single query to blog_post_tags with a join on blog_tags,
 * then maps the results back to each post.
 *
 * @param {Array<{ id: string }>} posts - Array of post objects with at least an `id` field
 * @returns {Promise<Array>} Posts with an added `tags` array
 */
export async function attachTagsToPosts(posts) {
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
