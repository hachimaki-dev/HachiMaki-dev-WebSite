import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'
import { useToast } from '../../components/ui/Toast' // Assuming Toast exists based on context

function getImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function usePhotosAdmin(onSuccess) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const uploadPhoto = useCallback(
    async (file) => {
      setIsUploading(true)
      try {
        // 1. Get dimensions
        const { width, height } = await getImageDimensions(file)

        // 2. Upload to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file, { upsert: false })

        if (uploadError) throw uploadError

        // 3. Insert record into database
        const { error: dbError } = await supabase.from(TABLES.PHOTOS).insert({
          storage_path: filePath,
          width,
          height,
        })

        if (dbError) throw dbError

        toast({ message: 'Photo uploaded successfully', type: 'success' })
        if (onSuccess) onSuccess()
      } catch (error) {
        console.error('Upload error:', error)
        toast({ message: error.message, type: 'error' })
      } finally {
        setIsUploading(false)
      }
    },
    [toast, onSuccess]
  )

  const deletePhoto = useCallback(
    async (id, storagePath) => {
      setIsDeleting(true)
      try {
        // 1. Delete from database
        const { error: dbError } = await supabase.from(TABLES.PHOTOS).delete().eq('id', id)
        if (dbError) throw dbError

        // 2. Delete from storage
        const { error: storageError } = await supabase.storage.from('photos').remove([storagePath])
        if (storageError) throw storageError

        toast({ message: 'Photo deleted successfully', type: 'success' })
        if (onSuccess) onSuccess()
      } catch (error) {
        console.error('Delete error:', error)
        toast({ message: error.message, type: 'error' })
      } finally {
        setIsDeleting(false)
      }
    },
    [toast, onSuccess]
  )

  return { uploadPhoto, deletePhoto, isUploading, isDeleting }
}
