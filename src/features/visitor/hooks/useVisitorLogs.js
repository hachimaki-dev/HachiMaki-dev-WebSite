import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'

export function useVisitorLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueSessions: 0,
    topCountry: 'Unknown',
    topPage: 'Unknown',
    clicksCount: 0
  })

  // Calculate metrics locally from retrieved logs
  const calculateStats = (currentLogs) => {
    const totalLogs = currentLogs.length
    const uniqueSessions = new Set(currentLogs.map(l => l.visitor_id || l.session_id)).size

    const countryTally = {}
    const pageTally = {}
    let clicksCount = 0

    currentLogs.forEach(log => {
      const country = log.country || 'Unknown'
      countryTally[country] = (countryTally[country] || 0) + 1

      const page = log.page_path || '/'
      pageTally[page] = (pageTally[page] || 0) + 1

      if (log.action_type === 'click') {
        clicksCount++
      }
    })

    const topCountry = Object.entries(countryTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
    const topPage = Object.entries(pageTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    setStats({
      totalLogs,
      uniqueSessions,
      topCountry,
      topPage,
      clicksCount
    })
  }

  useEffect(() => {
    let isMounted = true

    const fetchLogs = async () => {
      try {
        setLoading(true)
        // Get logs from the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data, error: fetchErr } = await supabase
          .from(TABLES.VISITOR_LOGS)
          .select('*')
          .gt('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
          .limit(250)

        if (fetchErr) throw fetchErr

        if (isMounted) {
          setLogs(data || [])
          calculateStats(data || [])
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLogs()

    // Setup Supabase realtime channel to listen to INSERTs
    const channel = supabase
      .channel('visitor_logs_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.VISITOR_LOGS
        },
        (payload) => {
          if (isMounted) {
            setLogs(prev => {
              const updated = [payload.new, ...prev].slice(0, 250)
              calculateStats(updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { logs, stats, loading, error }
}
