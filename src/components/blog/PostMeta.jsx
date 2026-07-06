import { formatDate } from '../../utils/formatDate'
import { ReadingTime } from './ReadingTime'
import { TagPills } from './TagPills'
import './PostMeta.css'

/**
 * PostMeta — Composed component: date, reading time, tags, view count
 * @param {{ date: string, readingTime?: number, tags?: Array, viewCount?: number, layout?: 'inline'|'stacked' }} props
 */
export function PostMeta({ date, readingTime, tags, viewCount, layout = 'inline' }) {
  return (
    <div className={`post-meta post-meta--${layout}`}>
      <div className="post-meta__info">
        <time className="post-meta__date">
          {formatDate(date)}
        </time>

        {readingTime > 0 && (
          <>
            <span className="post-meta__sep">·</span>
            <ReadingTime minutes={readingTime} />
          </>
        )}

        {viewCount > 0 && (
          <>
            <span className="post-meta__sep">·</span>
            <span className="post-meta__views">
              {viewCount.toLocaleString()} vistas
            </span>
          </>
        )}
      </div>

      {tags && tags.length > 0 && (
        <TagPills tags={tags} size="sm" />
      )}
    </div>
  )
}
