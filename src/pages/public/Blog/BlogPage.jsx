import { Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Card, CardImage, CardContent } from '../../../components/ui/Card'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useBlogPosts } from '../../../features/blog/useBlogPosts'
import { formatDate } from '../../../utils/formatDate'
import './BlogPage.css'

export function BlogPage() {
  const { posts, loading, error } = useBlogPosts()

  if (loading) return <PageLoader />

  if (error) {
    return (
      <PageWrapper>
        <EmptyState
          icon="⚠️"
          title="Error al cargar posts"
          description={error}
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="blog-page">
        <header className="blog-page__header animate-slide-up">
          <h1 className="blog-page__title">Blog</h1>
          <p className="blog-page__subtitle">
            Pensamientos, aprendizajes y notas sobre desarrollo web y tecnología.
          </p>
        </header>

        {posts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Aún no hay posts"
            description="Los posts aparecerán aquí cuando se publiquen."
          />
        ) : (
          <div className="blog-page__list">
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
                  <time className="blog-card__date">
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.excerpt && (
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                  )}
                  <span className="blog-card__read">Leer artículo →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
