import { useParams, Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Badge } from '../../../components/ui/Badge'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useProject } from '../../../features/portfolio/useProjects'
import { ROUTES } from '../../../lib/constants'
import './ProjectDetailPage.css'

const ensureExternalLink = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { project, loading, error } = useProject(slug)

  if (loading) return <PageLoader />

  if (error || !project) {
    return (
      <PageWrapper narrow>
        <EmptyState
          icon="🔍"
          title="Proyecto no encontrado"
          description="El proyecto que buscas no existe o no está publicado."
          action={
            <Link to={ROUTES.PORTFOLIO} className="btn btn--secondary btn--md">
              ← Volver al portfolio
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <article className="project-detail page-enter">
        {/* Back */}
        <Link to={ROUTES.PORTFOLIO} className="project-detail__back">
          ← Portfolio
        </Link>

        {/* Header */}
        <header className="project-detail__header">
          <h1 className="project-detail__title">{project.title}</h1>
          {project.description && (
            <p className="project-detail__description">{project.description}</p>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="project-detail__tags">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="accent" size="md">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Action links */}
          <div className="project-detail__actions">
            {project.live_url && (
              <a
                href={ensureExternalLink(project.live_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--md"
              >
                Ver demo ↗
              </a>
            )}
            {project.repo_url && (
              <a
                href={ensureExternalLink(project.repo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary btn--md"
              >
                Código fuente ⟨/⟩
              </a>
            )}
          </div>
        </header>

        {/* Cover */}
        {project.cover_url && (
          <div className="project-detail__cover">
            <img src={project.cover_url} alt={project.title} />
          </div>
        )}

        {/* Content */}
        {project.content && (
          <div
            className="project-detail__content prose"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        )}

        {/* Footer */}
        <footer className="project-detail__footer">
          <Link to={ROUTES.PORTFOLIO} className="btn btn--secondary btn--md">
            ← Volver al portfolio
          </Link>
        </footer>
      </article>
    </PageWrapper>
  )
}
