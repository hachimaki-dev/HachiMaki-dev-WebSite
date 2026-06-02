import { useState, useEffect } from 'react'
import { usePhotos } from '../../../features/photos/usePhotos'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import './photos.css'

export function PhotosPage() {
  const { photos, loading, error } = usePhotos()
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Auto-select the first photo when loaded
  useEffect(() => {
    if (photos.length > 0 && !selectedPhoto) {
      setSelectedPhoto(photos[0])
    }
  }, [photos, selectedPhoto])

  if (loading) return <PageLoader />
  if (error) return <EmptyState title="Error" message={error} />
  if (!photos || photos.length === 0) return <EmptyState title="No photos yet" message="Come back later." />

  return (
    <div className="photos-page animate-fade-in">
      <section className="photos-hero">
        {selectedPhoto ? (
          <img
            src={selectedPhoto.publicUrl}
            alt="Selected visual"
            className="photos-hero__image animate-fade-in"
          />
        ) : (
          <div className="photos-hero__empty">Select a photo...</div>
        )}
      </section>

      <section className="photos-collage">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`photos-collage__item ${selectedPhoto?.id === photo.id ? 'photos-collage__item--active' : ''}`}
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.publicUrl}
              alt=""
              className="photos-collage__image"
              loading="lazy"
            />
          </div>
        ))}
      </section>
    </div>
  )
}
