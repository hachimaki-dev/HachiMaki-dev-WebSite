import { Link } from 'react-router-dom'
import './TagPills.css'

/**
 * TagPills — Clickable tag chips that link to /blog/tag/:slug
 * @param {{ tags: Array<{ id: string, name: string, slug: string, color?: string }>, size?: 'sm'|'md' }} props
 */
export function TagPills({ tags, size = 'sm' }) {
  if (!tags || tags.length === 0) return null

  return (
    <div className={`tag-pills tag-pills--${size}`}>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          to={`/blog/tag/${tag.slug}`}
          className="tag-pill"
          style={{
            '--tag-color': tag.color || 'var(--color-accent)',
          }}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
