import { Component } from 'react'
import { useRouteError } from 'react-router-dom'
import './ErrorFallback.css'

/**
 * ErrorFallback — Global error boundary with VHS/Surveillance aesthetic.
 * Used as errorElement in router.jsx to catch render errors gracefully.
 */

/* ── Class-based Error Boundary (React requirement) ── */
class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}

/* ── Visual component (functional, for reuse) ── */
function ErrorDisplay({ error, onReset }) {
  const glitchText = 'ERROR DE TRANSMISIÓN'

  return (
    <div className="error-fallback">
      <div className="error-fallback__scanlines"></div>

      <div className="error-fallback__content">
        <div className="error-fallback__marker">///</div>

        <h1 className="error-fallback__title" data-glitch={glitchText}>
          {glitchText}
        </h1>

        <div className="error-fallback__code">
          <span className="error-fallback__label">SEÑAL PERDIDA</span>
          <span className="error-fallback__status">CÓDIGO: FATAL_RENDER_EXCEPTION</span>
        </div>

        {error?.message && (
          <pre className="error-fallback__message">
            {error.message}
          </pre>
        )}

        <div className="error-fallback__actions">
          <button
            className="error-fallback__btn"
            onClick={onReset || (() => window.location.reload())}
          >
            REINICIAR SEÑAL
          </button>
          <button
            className="error-fallback__btn error-fallback__btn--ghost"
            onClick={() => window.history.back()}
          >
            VOLVER ATRÁS
          </button>
        </div>

        <div className="error-fallback__footer">
          <span className="error-fallback__rec-dot"></span>
          SISTEMA DE RECUPERACIÓN ACTIVO
        </div>
      </div>
    </div>
  )
}

/* ── Router errorElement wrapper ── */
export function RouteErrorFallback() {
  const error = useRouteError()

  return (
    <ErrorDisplay
      error={error}
      onReset={() => window.location.href = '/hachimaki-dev/'}
    />
  )
}

export { ErrorBoundaryInner as ErrorBoundary }
export default ErrorDisplay
