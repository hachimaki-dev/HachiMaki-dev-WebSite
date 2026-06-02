import './Card.css'

/**
 * Card — Reusable card component with hover effects
 * @param {object} props
 * @param {string} [props.className]
 * @param {boolean} [props.hoverable=true]
 * @param {function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
export function Card({ className = '', hoverable = true, onClick, children, ...rest }) {
  const Component = onClick ? 'button' : 'div'
  const classes = [
    'card',
    hoverable && 'card--hoverable',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Component className={classes} onClick={onClick} {...rest}>
      {children}
    </Component>
  )
}

/**
 * CardImage — Image section of a card
 */
export function CardImage({ src, alt = '', className = '' }) {
  return (
    <div className={`card__image ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="card__image-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
      )}
    </div>
  )
}

/**
 * CardContent — Content area of a card
 */
export function CardContent({ className = '', children }) {
  return <div className={`card__content ${className}`}>{children}</div>
}
