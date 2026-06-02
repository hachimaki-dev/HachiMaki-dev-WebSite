import './PageWrapper.css'

/**
 * PageWrapper — Main content wrapper with max-width and animations
 * @param {object} props
 * @param {boolean} [props.narrow=false] - Use narrow content width
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function PageWrapper({ narrow = false, className = '', children }) {
  return (
    <main
      className={`page-wrapper page-enter ${narrow ? 'page-wrapper--narrow' : ''} ${className}`}
    >
      {children}
    </main>
  )
}
