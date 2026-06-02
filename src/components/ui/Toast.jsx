import { createContext, useContext, useState, useCallback } from 'react'
import './Toast.css'

const ToastContext = createContext(null)

/**
 * useToast — Access toast notifications
 * @returns {{ toast: function }}
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/**
 * ToastProvider — Wrap app to enable toast notifications
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.type} animate-slide-up`}
            role="alert"
          >
            <span className="toast__icon">{ICONS[t.type]}</span>
            <span className="toast__message">{t.message}</span>
            <button
              className="toast__dismiss"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
