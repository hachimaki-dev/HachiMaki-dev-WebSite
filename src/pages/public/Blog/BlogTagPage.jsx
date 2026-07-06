import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PostMeta } from '../../../components/blog/PostMeta'
import { Pagination } from '../../../components/blog/Pagination'
import { useBlogPosts } from '../../../features/blog/useBlogPosts'
import { useBlogTag } from '../../../features/blog/useBlogTags'
import { ROUTES } from '../../../lib/constants'
import './BlogPage.css'
import Icon from '../../../components/ui/Icon'

export function BlogTagPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(1)
  const { tag, loading: tagLoading } = useBlogTag(slug)
  const { posts, loading, totalPages } = useBlogPosts({ tagSlug: slug, page })

  if (tagLoading || (loading && page === 1)) return <PageLoader />

  if (!tag) {
    return (
      <PageWrapper>
        <EmptyState
          icon={<Icon name="bookmark" />}
          title="Tag no encontrado"
          description="El tag que buscas no existe."
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
          <h1 className="blog-page__title">
            <span
              className="blog-page__tag-indicator"
              style={{ backgroundColor: tag.color || 'var(--color-accent)' }}
            ></span>
            {tag.name}
          </h1>
          <p className="blog-page__subtitle">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} con este tag
          </p>
        </header>

        {posts.length === 0 ? (
          <EmptyState
            icon={<Icon name="notes" />}
            title="Sin posts"
            description={`No hay posts publicados con el tag "${tag.name}".`}
          />
        ) : (
          <div className="blog-page__grid">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`blog-card animate-slide-up delay-${Math.min(i + 1, 6)}`}
              >
                {post.cover_url && (
                  <div className="blog-card__image">
                    <img src={post.cover_url} alt={post.title} loading="lazy" />
                  </div>
                )}
                <div className="blog-card__content">
                  <PostMeta
                    date={post.published_at || post.created_at}
                    readingTime={post.reading_time_min}
                    tags={post.tags}
                  />
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.excerpt && (
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                  )}
                  <span className="blog-card__read">Leer artículo <Icon name="arrow-right" /></span>
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
