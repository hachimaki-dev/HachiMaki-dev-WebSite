import { useEffect } from 'react'
import { StreamViewer } from './StreamViewer'
import { VodViewer } from './VodViewer'
import './StreamPlayerModal.css'

export function StreamPlayerModal({ slug, vodUrl, title, roomId, createdAt, onClose }) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="stream-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="stream-modal-content animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
      >
        {vodUrl ? (
          <VodViewer url={vodUrl} title={title} roomId={roomId} createdAt={createdAt} onClose={onClose} />
        ) : (
          <StreamViewer slug={slug} onClose={onClose} />
        )}
      </div>
    </div>
  )
}
