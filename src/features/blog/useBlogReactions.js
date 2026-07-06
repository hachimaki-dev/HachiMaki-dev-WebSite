import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useBlogReactions — Fetch and manage post reactions (e.g. 'boost')
 * @param {string} postId
 * @param {string} visitorId
 */
export function useBlogReactions(postId, visitorId) {
  const [reactions, setReactions] = useState([])
  const [hasBoosted, setHasBoosted] = useState(false)
  const [boostCount, setBoostCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchReactions = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    
    const { data, error } = await supabase
      .from(TABLES.BLOG_REACTIONS)
      .select('visitor_id, reaction_type')
      .eq('post_id', postId)

    if (!error && data) {
      setReactions(data)
      const boosts = data.filter(r => r.reaction_type === 'boost')
      setBoostCount(boosts.length)
      if (visitorId) {
        setHasBoosted(boosts.some(r => r.visitor_id === visitorId))
      }
    }
    setLoading(false)
  }, [postId, visitorId])

  useEffect(() => {
    fetchReactions()
  }, [fetchReactions])

  const addBoost = async () => {
    if (!postId || !visitorId || hasBoosted) return false

    // Optimistic update
    setHasBoosted(true)
    setBoostCount(prev => prev + 1)

    const { error } = await supabase
      .from(TABLES.BLOG_REACTIONS)
      .insert({
        post_id: postId,
        visitor_id: visitorId,
        reaction_type: 'boost'
      })

    if (error) {
      // Revert if error
      setHasBoosted(false)
      setBoostCount(prev => prev - 1)
      return false
    }

    return true
  }

  return { reactions, boostCount, hasBoosted, addBoost, loading }
}
