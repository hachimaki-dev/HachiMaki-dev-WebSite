import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

export function usePhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from(TABLES.PHOTOS)
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Add public URL
        const photosWithUrl = data.map((photo) => {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.storage_path)

          return {
            ...photo,
            publicUrl: urlData.publicUrl,
            aspectRatio: photo.width && photo.height ? photo.width / photo.height : 1, // Fallback to 1
          }
        })

        setPhotos(photosWithUrl)
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  return { photos, loading, error }
}
