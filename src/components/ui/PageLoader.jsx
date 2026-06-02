import './PageLoader.css'

/**
 * PageLoader — Full-page loading spinner
 */
export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Cargando">
      <div className="page-loader__spinner">
        <div className="page-loader__ring"></div>
        <div className="page-loader__ring page-loader__ring--inner"></div>
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  )
}
