import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { useBlogPosts } from '../../../features/blog/useBlogPosts'
import { usePublicLiveStreams } from '../../../features/streaming/hooks/usePublicLiveStreams'
import { formatDate } from '../../../utils/formatDate'
import { ROUTES } from '../../../lib/constants'
import './HomePage.css'

export function HomePage() {
  const { posts: latestPosts, loading: postsLoading } = useBlogPosts()
  const { stories, loading: streamsLoading } = usePublicLiveStreams()

  /* Live clock */
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const timestamp = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <PageWrapper>
      <div className="vhs-scanlines vhs-noise"></div>

      {/* ═══ Main grid: Sidebar photo | Content ═══ */}
      <div className="outsider">
        {/* ── Left: VHS Cassette Case ── */}
        <aside className="outsider__profile">
          <div className="vhs-case">
            {/* Spine / Lomo */}
            <div className="vhs-case__spine">
              <span className="vhs-case__spine-text">HACHIMAKI</span>
              <span className="vhs-case__spine-code">T-120</span>
            </div>

            {/* Case body */}
            <div className="vhs-case__body">
              {/* Retro stripes */}
              <div className="vhs-case__stripes"></div>

              {/* Photo */}
              <div className="vhs-case__photo-wrap">
                <img
                  src="/hachimaki-dev/hachimaki-profile.png"
                  alt="HachiMaki"
                  className="vhs-case__photo"
                />
                <div className="vhs-case__photo-scanlines"></div>
                {/* Worn edges */}
                <div className="vhs-case__worn-edges"></div>
              </div>

              {/* VHS label info */}
              <div className="vhs-case__label">
                <div className="vhs-case__label-row">
                  <span className="vhs-case__badge">VHS</span>
                  <span className="vhs-case__badge">HQ</span>
                </div>
                <div className="vhs-case__meta">
                  <span>CLEARANCE: OMEGA-6</span>
                </div>
              </div>

              {/* Bottom stripes */}
              <div className="vhs-case__stripes vhs-case__stripes--bottom"></div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="outsider__agent-status">
            <span className="outsider__status-dot"></span>
            SEÑAL ACTIVA
          </div>
        </aside>

        {/* ── Center: Main content — News/Blog feed ── */}
        <main className="outsider__main">
          {/* Unified Transmissions Panel */}
          <div className="outsider__feed-header outsider__feed-header--unified">
            <div className="outsider__feed-header-top">
              <div className="outsider__feed-header-left">
                <h1 className="outsider__feed-title">
                  TRANSMISIONES
                  <span className="outsider__badge-active">EN VIVO</span>
                </h1>
              </div>
            </div>

            {/* Stories row (Active Streams & VODs) */}
            {!streamsLoading && stories && stories.length > 0 && (
              <div className="outsider__stories">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    to={story.link}
                    target={story.type === 'vod' ? '_blank' : undefined}
                    rel={story.type === 'vod' ? 'noopener noreferrer' : undefined}
                    className={`outsider__story outsider__story--${story.type}`}
                  >
                    <div className="outsider__story-ring">
                      <div className="outsider__story-avatar-wrap">
                        <img src={story.avatar} alt="Avatar" className="outsider__story-avatar" />
                        {story.type === 'vod' && (
                          <div className="outsider__story-vod-icon">▶</div>
                        )}
                        <div className="vhs-case__worn-edges"></div>
                      </div>
                    </div>
                    <span className="outsider__story-title">{story.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Blog feed */}
          {postsLoading ? (
            <div className="outsider__feed-loading">
              <div className="outsider__feed-loading-bar"></div>
              <span>CARGANDO SEÑALES...</span>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="outsider__feed-empty">
              <span className="outsider__feed-empty-icon">◎</span>
              <span>NO HAY SEÑALES DETECTADAS</span>
              <span className="outsider__feed-empty-sub">Las transmisiones aparecerán aquí cuando se publiquen desde el panel de control.</span>
            </div>
          ) : (
            <div className="outsider__feed">
              {latestPosts.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className={`outsider__feed-item animate-slide-up delay-${Math.min(i + 1, 6)}`}
                >
                  {/* Feed item header */}
                  <div className="outsider__feed-item-header">
                    <span className="outsider__feed-item-id">
                      SEÑAL-{String(i + 1).padStart(3, '0')}
                    </span>
                    <span className="outsider__feed-item-date">
                      {formatDate(post.published_at || post.created_at).toUpperCase()}
                    </span>
                  </div>

                  {/* Cover image if available */}
                  {post.cover_url && (
                    <div className="outsider__feed-item-cover">
                      <img src={post.cover_url} alt={post.title} />
                      <div className="vhs-case__worn-edges"></div>
                    </div>
                  )}

                  {/* Title + excerpt */}
                  <h2 className="outsider__feed-item-title">{post.title}</h2>
                  {post.excerpt && (
                    <p className="outsider__feed-item-excerpt">{post.excerpt}</p>
                  )}

                  {/* Footer bar */}
                  <div className="outsider__feed-item-footer">
                    <span className="outsider__feed-item-status">
                      <span className="outsider__status-dot"></span>
                      TRANSMITIDO
                    </span>
                    <span className="outsider__feed-item-action">LEER SEÑAL →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* ── Right: Nav sidebar ── */}
        <aside className="outsider__sidebar animate-slide-up delay-4">
          <div className="outsider__sidebar-title">NAVEGACIÓN</div>
          <nav className="outsider__sidebar-nav">
            <Link to={ROUTES.HOME} className="outsider__nav-item outsider__nav-item--active">
              <span className="outsider__nav-dot"></span> DASHBOARD
            </Link>
            <Link to={ROUTES.BLOG} className="outsider__nav-item">
              {'>'} SEÑALES
            </Link>
            <Link to={ROUTES.PORTFOLIO} className="outsider__nav-item">
              {'>'} ARCHIVO
            </Link>
            <a href="mailto:hello@hachimaki.dev" className="outsider__nav-item">
              {'>'} CONTACTO
            </a>
          </nav>

          {/* Agent info */}
          <div className="outsider__sidebar-agent">
            <img
              src="/hachimaki-dev/hachimaki-profile.png"
              alt="HachiMaki"
              className="outsider__sidebar-avatar"
            />
            <div>
              <div className="outsider__sidebar-user">USUARIO: OUTSIDER</div>
              <div className="outsider__sidebar-key">CLAVE: ************</div>
            </div>
          </div>

          {/* Clock */}
          <div className="outsider__sidebar-clock">{timestamp}</div>
        </aside>
      </div>
    </PageWrapper>
  )
}
