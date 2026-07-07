import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { saveFileHandle, getAllFileHandles, deleteFileHandle } from '../lib/fileSystemDb'

export function useNexusLibrary(visitorId) {
  const [localFiles, setLocalFiles] = useState([])
  const [sessionFiles, setSessionFiles] = useState([]) // For Firefox / Safari fallback
  const sessionFilesRef = useRef([]) // To access in callbacks easily
  const [peers, setPeers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [myStats, setMyStats] = useState({ downloads_count: 0, shares_count: 0 })
  const [nexusActivity, setNexusActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFileSystemAccess = 'showOpenFilePicker' in window

  // 1. Load Local Files from IndexedDB
  const loadLocalFiles = useCallback(async () => {
    try {
      const handles = await getAllFileHandles()
      const filesMeta = handles.map(h => h.metadata)
      setLocalFiles(filesMeta)
      return filesMeta
    } catch (err) {
      console.error('Error loading local files:', err)
      return []
    }
  }, [])

  // 2. Sync Combined Files to Supabase
  const syncToNetwork = useCallback(async (dbFilesMeta, memoryFilesArray) => {
    if (!visitorId) return
    const memMeta = memoryFilesArray.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      isActive: true
    }))
    
    const combinedFiles = [...dbFilesMeta, ...memMeta]

    const { error } = await supabase
      .from('peer_libraries')
      .upsert({
        visitor_id: visitorId,
        files: combinedFiles,
        is_online: true,
        last_seen: new Date().toISOString()
      }, { onConflict: 'visitor_id' })
      
    if (error) console.error('Error syncing to network:', error)
  }, [visitorId])

  // 3. Add Files (with Fallback)
  const addFiles = useCallback(async () => {
    if (hasFileSystemAccess) {
      try {
        const handles = await window.showOpenFilePicker({ multiple: true })
        for (const handle of handles) {
          const file = await handle.getFile()
          const metadata = {
            id: handle.name + '_' + file.size,
            name: handle.name,
            size: file.size,
            type: file.type,
            isActive: true
          }
          await saveFileHandle(metadata.id, handle, metadata)
        }
        const newFiles = await loadLocalFiles()
        await syncToNetwork(newFiles, sessionFilesRef.current)
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error adding files:', err)
      }
    } else {
      // Fallback for Firefox/Safari
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.onchange = async (e) => {
        const files = Array.from(e.target.files)
        const newSessionFiles = files.map(f => {
          // Attach an ID to the file object directly
          f.id = f.name + '_' + f.size
          return f
        })
        
        const combinedSession = [...sessionFilesRef.current, ...newSessionFiles]
        // Deduplicate
        const uniqueSession = Array.from(new Map(combinedSession.map(f => [f.id, f])).values())
        
        sessionFilesRef.current = uniqueSession
        setSessionFiles(uniqueSession)
        
        const currentDbFiles = await loadLocalFiles()
        await syncToNetwork(currentDbFiles, uniqueSession)
      }
      input.click()
    }
  }, [hasFileSystemAccess, loadLocalFiles, syncToNetwork])

  // 4. Reactivate Stored Files (IndexedDB only)
  const reactivateFile = useCallback(async (fileId) => {
    try {
      const handles = await getAllFileHandles()
      const item = handles.find(h => h.metadata.id === fileId)
      if (!item) return
      
      const options = { mode: 'read' }
      if ((await item.handle.queryPermission(options)) !== 'granted') {
        const permission = await item.handle.requestPermission(options)
        if (permission !== 'granted') throw new Error('Permiso denegado')
      }
      
      item.metadata.isActive = true
      await saveFileHandle(item.metadata.id, item.handle, item.metadata)
      
      const newFiles = await loadLocalFiles()
      await syncToNetwork(newFiles, sessionFilesRef.current)
    } catch (err) {
      console.error('Error reactivating file:', err)
    }
  }, [loadLocalFiles, syncToNetwork])

  // 5. Remove File
  const removeFile = useCallback(async (fileId) => {
    // Check if it's in session files
    const isSession = sessionFilesRef.current.find(f => f.id === fileId)
    if (isSession) {
      const updated = sessionFilesRef.current.filter(f => f.id !== fileId)
      sessionFilesRef.current = updated
      setSessionFiles(updated)
    } else {
      await deleteFileHandle(fileId)
    }
    
    const newFiles = await loadLocalFiles()
    await syncToNetwork(newFiles, sessionFilesRef.current)
  }, [loadLocalFiles, syncToNetwork])

  // 6. Get File Object for Sending
  const getFileToShare = useCallback(async (fileId) => {
    // Check session memory first
    const sessionFile = sessionFilesRef.current.find(f => f.id === fileId)
    if (sessionFile) return sessionFile

    // Check IndexedDB
    const handles = await getAllFileHandles()
    const item = handles.find(h => h.metadata.id === fileId)
    if (item && item.metadata.isActive) {
      const file = await item.handle.getFile()
      // Attach ID so it can be referenced later in the signaling flow
      file.id = item.metadata.id
      return file
    }
    
    return null
  }, [])

  // 7. Ping a user
  const sendPing = useCallback(async (receiverId, fileId, fileName) => {
    if (!visitorId) return
    const { error } = await supabase.from('peer_alerts').insert({
      sender_id: visitorId,
      receiver_id: receiverId,
      file_id: fileId,
      file_name: fileName,
      status: 'pending'
    })
    if (error) console.error('Error sending ping:', error)
  }, [visitorId])

  // 8. Stats & Activity
  const incrementStat = useCallback(async (statName) => {
    if (!visitorId) return
    // Simple RPC call is better, but since we don't have one, we can do a read and update
    const { data } = await supabase.from('peer_libraries').select(statName).eq('visitor_id', visitorId).single()
    if (data) {
      const newValue = (data[statName] || 0) + 1
      await supabase.from('peer_libraries').update({ [statName]: newValue }).eq('visitor_id', visitorId)
      setMyStats(prev => ({ ...prev, [statName]: newValue }))
    }
  }, [visitorId])

  const logActivity = useCallback(async (actionType, details) => {
    if (!visitorId) return
    const { error } = await supabase.from('nexus_activity').insert({
      visitor_id: visitorId,
      action_type: actionType,
      details: details
    })
    if (error) console.error('Error logging activity:', error)
  }, [visitorId])

  // Heartbeat updates
  const updateHeartbeat = useCallback(async () => {
    if (!visitorId) return
    const { error } = await supabase
      .from('peer_libraries')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('visitor_id', visitorId)
    if (error) console.error('Error updating heartbeat:', error)
  }, [visitorId])

  // Initialization & Subscriptions
  useEffect(() => {
    if (!visitorId) return
    let mounted = true

    const init = async () => {
      const files = await loadLocalFiles()
      for (const file of files) {
        file.isActive = false
        const handles = await getAllFileHandles()
        const item = handles.find(h => h.metadata.id === file.id)
        if (item) {
          await saveFileHandle(item.metadata.id, item.handle, file)
        }
      }
      
      const freshFiles = await loadLocalFiles()
      await syncToNetwork(freshFiles, sessionFilesRef.current)

      const { data: peersData } = await supabase
        .from('peer_libraries')
        .select('*')
        .neq('visitor_id', visitorId)
        .eq('is_online', true)
      
      if (mounted && peersData) setPeers(peersData)

      const { data: alertsData } = await supabase
        .from('peer_alerts')
        .select('*')
        .eq('receiver_id', visitorId)
        .eq('status', 'pending')

      if (mounted && alertsData) setAlerts(alertsData)

      // Fetch my stats
      const { data: myData } = await supabase
        .from('peer_libraries')
        .select('downloads_count, shares_count')
        .eq('visitor_id', visitorId)
        .single()
      
      if (mounted && myData) {
        setMyStats({ downloads_count: myData.downloads_count || 0, shares_count: myData.shares_count || 0 })
      }

      // Fetch activity
      const { data: activityData } = await supabase
        .from('nexus_activity')
        .select('*')
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: false })
        .limit(10)
        
      if (mounted && activityData) {
        setNexusActivity(activityData)
      }

      if (mounted) setLoading(false)
    }

    init()

    // Start heartbeat
    const heartbeatInterval = setInterval(() => {
      if (mounted) updateHeartbeat()
    }, 20000)

    const peersSub = supabase.channel('nexus_peers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peer_libraries' }, (payload) => {
        const newPeer = payload.new
        const oldPeer = payload.old
        if (newPeer && newPeer.visitor_id === visitorId) return
        
        setPeers(prev => {
          if (payload.eventType === 'DELETE') {
            const deletedId = oldPeer ? oldPeer.visitor_id : null
            return prev.filter(p => p.visitor_id !== deletedId)
          }
          
          const peerId = newPeer ? newPeer.visitor_id : null
          if (!peerId) return prev
          
          const filtered = prev.filter(p => p.visitor_id !== peerId)
          
          if (!newPeer.is_online) return filtered
          
          return [...filtered, newPeer]
        })
      })
      .subscribe()

    const alertsSub = supabase.channel('nexus_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'peer_alerts', filter: `receiver_id=eq.${visitorId}` }, (payload) => {
        setAlerts(prev => [...prev, payload.new])
      })
      .subscribe()

    const activitySub = supabase.channel('nexus_activity_sub')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_activity', filter: `visitor_id=eq.${visitorId}` }, (payload) => {
        setNexusActivity(prev => [payload.new, ...prev].slice(0, 10))
      })
      .subscribe()

    const handleUnload = () => {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/peer_libraries?visitor_id=eq.${visitorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ is_online: false }),
        keepalive: true
      })
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      mounted = false
      clearInterval(heartbeatInterval)
      supabase.removeChannel(peersSub)
      supabase.removeChannel(alertsSub)
      supabase.removeChannel(activitySub)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [visitorId, loadLocalFiles, syncToNetwork, updateHeartbeat])

  // Combine display files
  const sessionMeta = sessionFiles.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type, isActive: true, isEphemeral: true }))
  const displayFiles = [...localFiles, ...sessionMeta]

  return {
    displayFiles,
    peers,
    alerts,
    myStats,
    nexusActivity,
    loading,
    hasFileSystemAccess,
    addFiles,
    reactivateFile,
    removeFile,
    getFileToShare,
    sendPing,
    incrementStat,
    logActivity
  }
}
