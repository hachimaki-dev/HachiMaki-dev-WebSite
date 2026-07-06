import { Link } from 'react-router-dom'
import './SeriesNav.css'

/**
 * SeriesNav — Navigation for posts that belong to a series
 * @param {{ series: { title: string, slug: string }, posts: Array<{ id: string, slug: string, title: string, series_order: number }>, currentPostId: string }} props
 */
export function SeriesNav({ series, posts, currentPostId }) {
  if (!series || !posts || posts.length < 2) return null

  const sorted = [...posts].sort((a, b) => a.series_order - b.series_order)
  const currentIndex = sorted.findIndex(p => p.id === currentPostId)

  return (
    <div className="series-nav">
      <div className="series-nav__header">
        <span className="series-nav__badge">SERIE</span>
        <Link to={`/blog/series/${series.slug}`} className="series-nav__title">
          {series.title}
        </Link>
        <span className="series-nav__count">
          Parte {currentIndex + 1} de {sorted.length}
        </span>
      </div>

      <ol className="series-nav__list">
        {sorted.map((post, i) => (
          <li
            key={post.id}
            className={`series-nav__item ${post.id === currentPostId ? 'series-nav__item--current' : ''}`}
          >
            {post.id === currentPostId ? (
              <span className="series-nav__link series-nav__link--current">
                <span className="series-nav__number">{i + 1}</span>
                {post.title}
              </span>
            ) : (
              <Link to={`/blog/${post.slug}`} className="series-nav__link">
                <span className="series-nav__number">{i + 1}</span>
                {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
