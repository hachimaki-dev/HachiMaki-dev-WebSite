import { useParams, Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useBlogPost } from '../../../features/blog/useBlogPosts'
import { formatDate } from '../../../utils/formatDate'
import { ROUTES } from '../../../lib/constants'
import './BlogPostPage.css'

export function BlogPostPage() {
  const { slug } = useParams()
  const { post, loading, error } = useBlogPost(slug)

  if (loading) return <PageLoader />

  if (error || !post) {
    return (
      <PageWrapper narrow>
        <EmptyState
          icon="🔍"
          title="Post no encontrado"
          description="El post que buscas no existe o no está publicado."
          action={
            <Link to={ROUTES.BLOG} className="btn btn--secondary btn--md">
              ← Volver al blog
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper narrow>
      <article className="blog-post page-enter">
        {/* Back link */}
        <Link to={ROUTES.BLOG} className="blog-post__back">
          ← Blog
        </Link>

        {/* Header */}
        <header className="blog-post__header">
          <time className="blog-post__date">
            {formatDate(post.published_at || post.created_at)}
          </time>
          <h1 className="blog-post__title">{post.title}</h1>
          {post.excerpt && (
            <p className="blog-post__excerpt">{post.excerpt}</p>
          )}
        </header>

        {/* Cover image */}
        {post.cover_url && (
          <div className="blog-post__cover">
            <img src={post.cover_url} alt={post.title} />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-post__content prose"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Footer */}
        <footer className="blog-post__footer">
          <Link to={ROUTES.BLOG} className="btn btn--secondary btn--md">
            ← Volver al blog
          </Link>
        </footer>
      </article>
    </PageWrapper>
  )
}
