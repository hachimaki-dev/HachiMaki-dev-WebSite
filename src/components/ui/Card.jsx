import './Card.css'
import Icon from './Icon'

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
          <Icon name="image" size={32} />
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
