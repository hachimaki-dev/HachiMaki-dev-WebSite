/**
 * useFriendLinksAdmin.js — Admin CRUD hook for link exchange management
 *
 * Handles fetching, inserting, updating, and deleting friend links.
 * Also handles uploading banners to Supabase Storage and cleaning up files upon deletion.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

export function useFriendLinksAdmin() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabase
        .from(TABLES.FRIEND_LINKS)
        .select('*')
        .order('sort_order', { ascending: true })

      if (dbError) throw dbError
      setLinks(data || [])
    } catch (err) {
      console.error('Error fetching admin friendly links:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  /** Create a new friendly link */
  const create = async (payload) => {
    const { data, error: dbError } = await supabase
      .from(TABLES.FRIEND_LINKS)
      .insert(payload)
      .select()
      .single()

    if (dbError) throw dbError
    setLinks((prev) => [...prev, data].sort((a, b) => a.sort_order - b.sort_order))
    return data
  }

  /** Update an existing friendly link */
  const update = async (id, payload) => {
    const { data, error: dbError } = await supabase
      .from(TABLES.FRIEND_LINKS)
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (dbError) throw dbError
    setLinks((prev) => prev.map((l) => (l.id === id ? data : l)).sort((a, b) => a.sort_order - b.sort_order))
    return data
  }

  /** Delete a banner file from storage */
  const deleteBannerFile = async (imageUrl) => {
    const bucketMarker = '/storage/v1/object/public/friend_banners/'
    if (imageUrl && imageUrl.includes(bucketMarker)) {
      const filename = imageUrl.split(bucketMarker).pop()
      if (filename) {
        try {
          const { error: storageError } = await supabase.storage
            .from('friend_banners')
            .remove([filename])
          if (storageError) throw storageError
        } catch (err) {
          console.error('Failed to clean up banner file from storage:', err.message)
        }
      }
    }
  }

  /** Remove a friendly link and its banner */
  const remove = async (id, imageUrl) => {
    const { error: dbError } = await supabase
      .from(TABLES.FRIEND_LINKS)
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    if (imageUrl) {
      await deleteBannerFile(imageUrl)
    }

    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  /** Upload a banner image to storage */
  const uploadBanner = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('friend_banners')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('friend_banners')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  return {
    links,
    loading,
    error,
    refresh: fetchLinks,
    create,
    update,
    remove,
    uploadBanner,
    deleteBannerFile,
  }
}
