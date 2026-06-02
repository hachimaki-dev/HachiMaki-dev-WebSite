import './Badge.css'

/**
 * Badge — Tag/status badge component
 * @param {object} props
 * @param {'default'|'accent'|'success'|'warning'|'danger'} [props.variant='default']
 * @param {'sm'|'md'} [props.size='sm']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({ variant = 'default', size = 'sm', className = '', children }) {
  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`}>
      {children}
    </span>
  )
}
