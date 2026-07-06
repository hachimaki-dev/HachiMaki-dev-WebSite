import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PostMeta } from '../../../components/blog/PostMeta'
import { Pagination } from '../../../components/blog/Pagination'
import { useBlogPosts } from '../../../features/blog/useBlogPosts'
import { useBlogSeries } from '../../../features/blog/useBlogSeries'
import { ROUTES } from '../../../lib/constants'
import './BlogPage.css'
import Icon from '../../../components/ui/Icon'

export function BlogSeriesPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(1)
  const { series, loading: seriesLoading } = useBlogSeries(slug)
  const { posts, loading, totalPages } = useBlogPosts({ seriesSlug: slug, page })

  if (seriesLoading || (loading && page === 1)) return <PageLoader />

  if (!series) {
    return (
      <PageWrapper>
        <EmptyState
          icon={<Icon name="notebook" />}
          title="Serie no encontrada"
          description="La serie que buscas no existe."
          action={
            <Link to={ROUTES.BLOG} className="btn btn--secondary btn--md">
              <Icon name="arrow-left" /> Volver al blog
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="blog-page">
        <header className="blog-page__header animate-slide-up">
          <Link to={ROUTES.BLOG} className="blog-post__back"><Icon name="arrow-left" /> Blog</Link>
          <div className="blog-page__series-badge">SERIE</div>
          <h1 className="blog-page__title">{series.title}</h1>
          {series.description && (
            <p className="blog-page__subtitle">{series.description}</p>
          )}
          <p className="blog-page__subtitle" style={{ marginTop: 'var(--space-2)' }}>
            {posts.length} {posts.length === 1 ? 'parte' : 'partes'}
          </p>
        </header>

        {posts.length === 0 ? (
          <EmptyState
            icon={<Icon name="notes" />}
            title="Sin posts"
            description="Esta serie aún no tiene posts publicados."
          />
        ) : (
          <div className="blog-page__list">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`blog-card blog-card--horizontal animate-slide-up delay-${Math.min(i + 1, 6)}`}
              >
                <div className="blog-card__order">
                  <span className="blog-card__order-num">{post.series_order || i + 1}</span>
                </div>
                {post.cover_url && (
                  <div className="blog-card__image blog-card__image--sm">
                    <img src={post.cover_url} alt={post.title} loading="lazy" />
                  </div>
                )}
                <div className="blog-card__content">
                  <PostMeta
                    date={post.published_at || post.created_at}
                    readingTime={post.reading_time_min}
                  />
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.excerpt && (
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                  )}
                  <span className="blog-card__read">Leer parte {post.series_order || i + 1} <Icon name="arrow-right" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageWrapper>
  )
}
