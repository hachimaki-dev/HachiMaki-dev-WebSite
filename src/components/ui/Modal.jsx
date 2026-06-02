import { useEffect, useRef } from 'react'
import './Modal.css'

/**
 * Modal — Dialog overlay component
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {string} [props.title]
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.children
 */
export function Modal({ open, onClose, title, size = 'md', children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        ref={dialogRef}
        className={`modal modal--${size} animate-scale-in`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5L5 15"/>
              </svg>
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
