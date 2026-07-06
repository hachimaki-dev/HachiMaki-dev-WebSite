import { Link } from 'react-router-dom'
import { useBlogAdmin } from '../../../features/blog/useBlogAdmin'
import { useProjectsAdmin } from '../../../features/portfolio/useProjectsAdmin'
import { PageLoader } from '../../../components/ui/PageLoader'
import { ROUTES } from '../../../lib/constants'
import './DashboardPage.css'
import Icon from '../../../components/ui/Icon'

export function DashboardPage() {
  const { posts, loading: postsLoading } = useBlogAdmin()
  const { projects, loading: projectsLoading } = useProjectsAdmin()

  if (postsLoading || projectsLoading) return <PageLoader />

  const publishedPosts = posts.filter(p => p.published).length
  const draftPosts = posts.filter(p => !p.published).length
  const publishedProjects = projects.filter(p => p.published).length
  const featuredProjects = projects.filter(p => p.featured).length

  const stats = [
    { label: 'Posts publicados', value: publishedPosts, icon: <Icon name="notes" />, color: 'accent' },
    { label: 'Borradores', value: draftPosts, icon: <Icon name="clipboard" />, color: 'warning' },
    { label: 'Proyectos publicados', value: publishedProjects, icon: <Icon name="speed-fast" />, color: 'success' },
    { label: 'Destacados', value: featuredProjects, icon: <Icon name="star" />, color: 'info' },
  ]

  const recentPosts = posts.slice(0, 5)

  return (
    <div className="dashboard page-enter">
      <h1 className="dashboard__title">Dashboard</h1>
      <p className="dashboard__subtitle">Resumen de tu contenido</p>

      {/* Stats */}
      <div className="dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className={`dashboard__stat dashboard__stat--${stat.color}`}>
            <span className="dashboard__stat-icon">{stat.icon}</span>
            <div>
              <span className="dashboard__stat-value">{stat.value}</span>
              <span className="dashboard__stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="dashboard__actions">
        <h2 className="dashboard__section-title">Acciones rápidas</h2>
        <div className="dashboard__action-grid">
          <Link to={ROUTES.ADMIN_BLOG_NEW} className="dashboard__action">
            <span className="dashboard__action-icon"><Icon name="magic-edit" /></span>
            <span>Nuevo post</span>
          </Link>
          <Link to={ROUTES.ADMIN_PORTFOLIO_NEW} className="dashboard__action">
            <span className="dashboard__action-icon"><Icon name="star" /></span>
            <span>Nuevo proyecto</span>
          </Link>
          <Link to={ROUTES.ADMIN_SETTINGS} className="dashboard__action">
            <span className="dashboard__action-icon"><Icon name="settings-2" /></span>
            <span>Configuración</span>
          </Link>
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="dashboard__recent">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Últimos posts</h2>
            <Link to={ROUTES.ADMIN_BLOG} className="dashboard__section-link">
              Ver todos <Icon name="arrow-right" />
            </Link>
          </div>
          <div className="dashboard__recent-list">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/admin/blog/${post.id}`}
                className="dashboard__recent-item"
              >
                <span className="dashboard__recent-title">{post.title}</span>
                <span className={`dashboard__recent-status ${post.published ? 'dashboard__recent-status--pub' : ''}`}>
                  {post.published ? 'Publicado' : 'Borrador'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
