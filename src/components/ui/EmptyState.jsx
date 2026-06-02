import './EmptyState.css'

/**
 * EmptyState — Placeholder for empty lists/pages
 * @param {object} props
 * @param {string} [props.icon] - Emoji or text icon
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state animate-fade-in">
      <span className="empty-state__icon">{icon}</span>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
