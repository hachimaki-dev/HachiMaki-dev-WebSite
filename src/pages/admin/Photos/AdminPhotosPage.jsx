import { useState } from 'react'
import { usePhotos } from '../../../features/photos/usePhotos'
import { usePhotosAdmin } from '../../../features/photos/usePhotosAdmin'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import './adminPhotos.css'

export function AdminPhotosPage() {
  const { photos, loading: fetchLoading, error } = usePhotos()
  const [fileList, setFileList] = useState([])
  const { uploadPhoto, deletePhoto, isUploading, isDeleting } = usePhotosAdmin(() => {
    // Ideally we would invalidate the fetch or refetch here. 
    // To keep it simple, we just reload the window or let the state handle it.
    window.location.reload()
  })

  const handleFileChange = (e) => {
    setFileList(Array.from(e.target.files))
  }

  const handleUpload = async () => {
    for (const file of fileList) {
      await uploadPhoto(file)
    }
    setFileList([])
  }

  return (
    <div className="admin-photos">
      <header className="admin-photos__header">
        <h1 className="admin-photos__title">Manage Photos</h1>
      </header>

      <section className="admin-photos__upload-section">
        <div className="admin-photos__upload-box">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            disabled={isUploading}
            className="admin-photos__file-input"
          />
          {fileList.length > 0 && (
            <div className="admin-photos__upload-actions">
              <p>{fileList.length} file(s) selected.</p>
              <button 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="admin-photos__grid-section">
        {fetchLoading && <PageLoader />}
        {error && <EmptyState title="Error" message={error} />}
        {!fetchLoading && photos.length === 0 && <EmptyState title="No photos" message="Upload some photos above." />}
        
        {!fetchLoading && photos.length > 0 && (
          <div className="admin-photos__grid">
            {photos.map(photo => (
              <div key={photo.id} className="admin-photos__item">
                <img src={photo.publicUrl} alt="" className="admin-photos__image" />
                <button 
                  className="admin-photos__delete-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this photo?')) {
                      deletePhoto(photo.id, photo.storage_path)
                    }
                  }}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
