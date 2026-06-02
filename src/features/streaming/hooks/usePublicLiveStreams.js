import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'

export function usePublicLiveStreams() {
  const [liveStreams, setLiveStreams] = useState([])
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLiveStreams = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(TABLES.ROOMS)
      .select('id, slug, title, caster_id')
      .eq('status', 'live')
      .eq('is_private', false)
      .order('started_at', { ascending: false })

    if (!error && data) {
      setLiveStreams(data)
    }

    // Fetch recent recordings from public rooms
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recData, error: recError } = await supabase
      .from(TABLES.RECORDINGS)
      .select('id, file_path, created_at, caster_id, rooms!inner(title, is_private)')
      .eq('rooms.is_private', false)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch avatars for casters
    const casterIds = [
      ...(data || []).map(r => r.caster_id),
      ...(recData || []).map(r => r.caster_id)
    ].filter(Boolean)
    const uniqueCasterIds = [...new Set(casterIds)]

    let profilesMap = {}
    if (uniqueCasterIds.length > 0) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .in('id', uniqueCasterIds)
      
      if (profData) {
        profilesMap = profData.reduce((acc, profile) => {
          acc[profile.id] = profile.avatar_url
          return acc
        }, {})
      }
    }

    if (!error && data) {
      setLiveStreams(data.map(d => ({ ...d, avatar_url: profilesMap[d.caster_id] })))
    }

    if (!recError && recData) {
      setRecordings(recData.map(r => ({ ...r, avatar_url: profilesMap[r.caster_id] })))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLiveStreams()
    
    // Subscribe to changes in rooms to update the stories dynamically
    const channel = supabase
      .channel('public-live-streams')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.ROOMS },
        () => fetchLiveStreams()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLiveStreams])

  // Combine into a single "stories" array
  const stories = [
    ...liveStreams.map(s => ({
      id: `live-${s.id}`,
      type: 'live',
      title: s.title,
      slug: s.slug,
      avatar: s.avatar_url || '/hachimaki-dev/hachimaki-profile.png',
      link: `/stream/${s.slug}/watch`
    })),
    ...recordings.map(r => {
      const { data } = supabase.storage.from('recordings').getPublicUrl(r.file_path)
      return {
        id: `vod-${r.id}`,
        type: 'vod',
        title: `${r.rooms?.title || 'VOD'}`,
        avatar: r.avatar_url || '/hachimaki-dev/hachimaki-profile.png',
        url: data?.publicUrl,
        link: data?.publicUrl, // Direct link to video
      }
    })
  ]

  return { liveStreams, stories, loading }
}
