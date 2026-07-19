import { useParams, Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { MarkdownRenderer } from '../../../components/blog/MarkdownRenderer'
import { TableOfContents } from '../../../components/blog/TableOfContents'
import { PostMeta } from '../../../components/blog/PostMeta'
import { SeriesNav } from '../../../components/blog/SeriesNav'
import { TagPills } from '../../../components/blog/TagPills'
import { useBlogPost } from '../../../features/blog/useBlogPosts'
import { ROUTES } from '../../../lib/constants'
import { BlogShare } from '../../../components/blog/BlogShare'
import { BlogReactions } from '../../../components/blog/BlogReactions'
import { BlogComments } from '../../../components/blog/BlogComments'
import { NewsletterInvite } from '../../../components/ui/NewsletterInvite'
import { SEO } from '../../../components/ui/SEO'
import './BlogPostPage.css'
import Icon from '../../../components/ui/Icon'

export function BlogPostPage() {
  const { slug } = useParams()
  const { post, seriesPosts, relatedPosts, loading, error } = useBlogPost(slug)

  if (loading) return <PageLoader />

  if (error || !post) {
    return (
      <PageWrapper narrow>
        <EmptyState
          icon={<Icon name="search" />}
          title="Post no encontrado"
          description="El post que buscas no existe o no está publicado."
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
      <SEO 
        title={post.title} 
        description={post.excerpt || post.title} 
        type="article"
        image={post.cover_url}
        url={window.location.href}
      />
      <article className="blog-post page-enter">
        {/* Back link */}
        <Link to={ROUTES.BLOG} className="blog-post__back">
          <Icon name="arrow-left" /> Blog
        </Link>

        {/* Header */}
        <header className="blog-post__header">
          <PostMeta
            date={post.published_at || post.created_at}
            readingTime={post.reading_time_min}
            tags={post.tags}
            viewCount={post.view_count}
            layout="stacked"
          />
          <h1 className="blog-post__title">{post.title}</h1>
          <BlogShare title={post.title} />
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

        {/* Series navigation (before content) */}
        {post.series && seriesPosts.length > 1 && (
          <SeriesNav
            series={post.series}
            posts={seriesPosts}
            currentPostId={post.id}
          />
        )}

        {/* Content + TOC layout */}
        <div className="blog-post__body">
          {/* Main content */}
          <div className="blog-post__content">
            <MarkdownRenderer
              content={post.content || ''}
              format={post.content_format || 'html'}
            />
          </div>

          {/* Sticky TOC sidebar */}
          <aside className="blog-post__toc">
            <TableOfContents
              content={post.content || ''}
              format={post.content_format || 'html'}
            />
          </aside>
        </div>

        {/* Series navigation (after content) */}
        {post.series && seriesPosts.length > 1 && (
          <SeriesNav
            series={post.series}
            posts={seriesPosts}
            currentPostId={post.id}
          />
        )}

        {/* Reactions */}
        <BlogReactions postId={post.id} />

        {/* Newsletter */}
        <div style={{ margin: 'var(--space-8) 0' }}>
          <NewsletterInvite />
        </div>

        {/* Comments */}
        <BlogComments postId={post.id} />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="blog-post__related">
            <h2 className="blog-post__related-title">Posts relacionados</h2>
            <div className="blog-post__related-grid">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="blog-post__related-card"
                >
                  {related.cover_url && (
                    <div className="blog-post__related-cover">
                      <img src={related.cover_url} alt={related.title} loading="lazy" />
                    </div>
                  )}
                  <div className="blog-post__related-info">
                    <h3 className="blog-post__related-name">{related.title}</h3>
                    {related.excerpt && (
                      <p className="blog-post__related-excerpt">{related.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="blog-post__footer">
          <Link to={ROUTES.BLOG} className="btn btn--secondary btn--md">
            <Icon name="arrow-left" /> Volver al blog
          </Link>
        </footer>
      </article>
    </PageWrapper>
  )
}
