import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROUTES, SITE } from '../../lib/constants'
import './LoginPage.css'

export function LoginPage() {
  const { user, loading, signIn, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* Already logged in → redirect to admin */
  if (!loading && user) {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const success = await signIn(email, password)
    setSubmitting(false)
    if (success) {
      navigate(ROUTES.ADMIN, { replace: true })
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-scale-in">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo__bracket">{`{`}</span>
            <span className="login-logo__text">hm</span>
            <span className="login-logo__bracket">{`}`}</span>
          </div>
          <h1 className="login-title">{SITE.NAME}</h1>
          <p className="login-subtitle">Panel de administración</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hachimaki.dev"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error animate-slide-down">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting ? (
              <span className="login-button__loader animate-spin">⟳</span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="login-back">← Volver al sitio</a>
        </div>
      </div>

      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg__grid"></div>
        <div className="login-bg__glow login-bg__glow--1"></div>
        <div className="login-bg__glow login-bg__glow--2"></div>
      </div>
    </div>
  )
}
