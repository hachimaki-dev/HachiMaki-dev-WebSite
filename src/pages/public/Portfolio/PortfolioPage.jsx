import { Link } from 'react-router-dom'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Card, CardImage, CardContent } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useProjects } from '../../../features/portfolio/useProjects'
import './PortfolioPage.css'
import Icon from '../../../components/ui/Icon'

export function PortfolioPage() {
  const { projects, loading, error } = useProjects()

  if (loading) return <PageLoader />

  if (error) {
    return (
      <PageWrapper>
        <EmptyState
          icon={<Icon name="warning-diamond" />}
          title="Error al cargar proyectos"
          description={error}
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="portfolio-page">
        <header className="portfolio-page__header animate-slide-up">
          <h1 className="portfolio-page__title">Portfolio</h1>
          <p className="portfolio-page__subtitle">
            Una selección de proyectos en los que he trabajado.
          </p>
        </header>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Icon name="speed-fast" />}
            title="Proyectos en camino"
            description="Los proyectos aparecerán aquí cuando se publiquen."
          />
        ) : (
          <div className="portfolio-grid">
            {projects.map((project, i) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.slug}`}
                className={`animate-slide-up delay-${Math.min(i + 1, 6)}`}
                style={{ textDecoration: 'none' }}
              >
                <Card>
                  <CardImage src={project.cover_url} alt={project.title} />
                  <CardContent>
                    <h3 className="portfolio-card__title">{project.title}</h3>
                    <p className="portfolio-card__desc">{project.description}</p>
                    {project.tags?.length > 0 && (
                      <div className="portfolio-card__tags">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="accent">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="portfolio-card__links">
                      {project.repo_url && (
                        <span className="portfolio-card__link-icon" title="Repositorio">
                          ⟨/⟩
                        </span>
                      )}
                      {project.live_url && (
                        <span className="portfolio-card__link-icon" title="Demo">
                          ↗
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
