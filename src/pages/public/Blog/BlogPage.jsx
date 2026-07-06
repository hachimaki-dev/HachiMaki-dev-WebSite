import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { SearchBar } from '../../../components/blog/SearchBar'
import { Pagination } from '../../../components/blog/Pagination'
import { useBlogPosts } from '../../../features/blog/useBlogPosts'
import { useBlogTags } from '../../../features/blog/useBlogTags'
import { formatDate } from '../../../utils/formatDate'
import { StreamStories } from '../Stream/StreamStories'
import './BlogPage.css'
import Icon from '../../../components/ui/Icon'

export function BlogPage() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [page, setPage] = useState(1)

  const { tags } = useBlogTags()
  const { posts, loading, error, totalPages } = useBlogPosts({
    search,
    tagSlug: activeTag,
    page,
  })

  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
  }

  const handleTagFilter = (slug) => {
    setActiveTag(slug === activeTag ? null : slug)
    setPage(1)
  }

  // Separate featured post (first one if exists and on page 1)
  const featuredPost = page === 1 && !search && !activeTag
    ? posts.find(p => p.featured) || posts[0]
    : null
  const remainingPosts = featuredPost
    ? posts.filter(p => p.id !== featuredPost.id)
    : posts

  if (error) {
    return (
      <PageWrapper>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="blog-empty" style={{ borderColor: 'var(--color-error)' }}>
          <span className="blog-empty-icon"><Icon name="warning-diamond" /></span>
          <span>ERROR DE TRANSMISIÓN</span>
          <span className="blog-empty-sub">{error}</span>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="vhs-scanlines vhs-noise"></div>
      <div className="blog-container">

        {/* Header */}
        <header className="blog-header animate-slide-up">
          <div className="blog-header__top">
            <h1 className="blog-title">
              TRANSMISIONES
              <span className="blog-badge-active">EN VIVO</span>
            </h1>
          </div>
        </header>

        {/* Stories Row */}
        <StreamStories className="animate-slide-up delay-1" />

        {/* Controls */}
        <div className="blog-controls animate-slide-up delay-1">
          <div className="blog-search-wrapper">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Buscar señales..."
            />
          </div>

          {tags.length > 0 && (
            <div className="blog-tags">
              <button
                className={`blog-tag-btn ${!activeTag ? 'blog-tag-btn--active' : ''}`}
                onClick={() => handleTagFilter(null)}
              >
                Todas
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`blog-tag-btn ${activeTag === tag.slug ? 'blog-tag-btn--active' : ''}`}
                  onClick={() => handleTagFilter(tag.slug)}
                >
                  {tag.name}
                  {tag.postCount > 0 && (
                    <span className="blog-tag-count">{tag.postCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="blog-loading">
            <div className="blog-loading-bar"></div>
            <span>DECODIFICANDO SEÑALES...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="blog-empty">
            <span className="blog-empty-icon">◎</span>
            <span>NO SE ENCONTRARON SEÑALES</span>
            <span className="blog-empty-sub">
              {search ? 'Ajuste los parámetros de búsqueda e intente nuevamente.' : 'Las transmisiones aparecerán aquí una vez publicadas.'}
            </span>
          </div>
        )}

        {/* Feed */}
        {!loading && posts.length > 0 && (
          <div className="blog-feed">
            {/* Featured Post */}
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="blog-feed-item blog-feed-hero animate-slide-up delay-2"
              >
                <div className="blog-feed-item-header">
                  <span className="blog-feed-item-id">SEÑAL-000 (DESTACADA)</span>
                  <span className="blog-feed-item-date">{formatDate(featuredPost.published_at || featuredPost.created_at).toUpperCase()}</span>
                </div>
                {featuredPost.cover_url && (
                  <div className="blog-feed-item-cover">
                    <img src={featuredPost.cover_url} alt={featuredPost.title} />
                  </div>
                )}
                <h2 className="blog-feed-item-title">{featuredPost.title}</h2>
                {featuredPost.excerpt && (
                  <p className="blog-feed-item-excerpt">{featuredPost.excerpt}</p>
                )}
                <div className="blog-feed-item-footer">
                  <span className="blog-status">
                    <span className="blog-status-dot"></span>
                    TRANSMITIDO
                  </span>
                  <span className="blog-action">LEER SEÑAL <Icon name="arrow-right" /></span>
                </div>
              </Link>
            )}

            {/* Remaining Posts */}
            {remainingPosts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`blog-feed-item animate-slide-up delay-${Math.min(i + 3, 6)}`}
              >
                <div className="blog-feed-item-header">
                  <span className="blog-feed-item-id">SEÑAL-{String(i + 1).padStart(3, '0')}</span>
                  <span className="blog-feed-item-date">{formatDate(post.published_at || post.created_at).toUpperCase()}</span>
                </div>
                {post.cover_url && (
                  <div className="blog-feed-item-cover">
                    <img src={post.cover_url} alt={post.title} loading="lazy" />
                  </div>
                )}
                <h2 className="blog-feed-item-title">{post.title}</h2>
                {post.excerpt && (
                  <p className="blog-feed-item-excerpt">{post.excerpt}</p>
                )}
                <div className="blog-feed-item-footer">
                  <span className="blog-status">
                    <span className="blog-status-dot"></span>
                    TRANSMITIDO
                  </span>
                  <span className="blog-action">LEER SEÑAL <Icon name="arrow-right" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ marginTop: 'var(--space-8)' }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

      </div>
    </PageWrapper>
  )
}
