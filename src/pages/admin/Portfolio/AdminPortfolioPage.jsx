import { Link } from 'react-router-dom'
import { useProjectsAdmin } from '../../../features/portfolio/useProjectsAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Modal } from '../../../components/ui/Modal'
import { ROUTES } from '../../../lib/constants'
import { useState } from 'react'
import './AdminPortfolioPage.css'
import Icon from '../../../components/ui/Icon'

export function AdminPortfolioPage() {
  const { projects, loading, togglePublished, toggleFeatured, remove } = useProjectsAdmin()
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const handleTogglePublish = async (project) => {
    setActionLoading(project.id)
    try {
      await togglePublished(project.id, !project.published)
      toast({ type: 'success', message: project.published ? 'Despublicado' : 'Publicado' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setActionLoading(null)
  }

  const handleToggleFeatured = async (project) => {
    setActionLoading(project.id)
    try {
      await toggleFeatured(project.id, !project.featured)
      toast({ type: 'success', message: project.featured ? 'Quitado de destacados' : 'Marcado como destacado' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setActionLoading(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id)
    try {
      await remove(deleteTarget.id)
      toast({ type: 'success', message: 'Proyecto eliminado' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setDeleteTarget(null)
    setActionLoading(null)
  }

  if (loading) return <PageLoader />

  return (
    <div className="admin-portfolio page-enter">
      <div className="admin-portfolio__header">
        <div>
          <h1 className="admin-portfolio__title">Portfolio</h1>
          <p className="admin-portfolio__subtitle">{projects.length} proyectos en total</p>
        </div>
        <Link to={ROUTES.ADMIN_PORTFOLIO_NEW}>
          <Button variant="primary">+ Nuevo proyecto</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Icon name="speed-fast" />}
          title="Sin proyectos"
          description="Crea tu primer proyecto."
          action={
            <Link to={ROUTES.ADMIN_PORTFOLIO_NEW}>
              <Button variant="primary">Crear proyecto</Button>
            </Link>
          }
        />
      ) : (
        <div className="admin-portfolio__list">
          {projects.map((project) => (
            <div key={project.id} className="admin-portfolio__item">
              <div className="admin-portfolio__item-info">
                <Link to={`/admin/portfolio/${project.id}`} className="admin-portfolio__item-title">
                  {project.title}
                </Link>
                <div className="admin-portfolio__item-meta">
                  <Badge variant={project.published ? 'success' : 'default'}>
                    {project.published ? 'Publicado' : 'Borrador'}
                  </Badge>
                  {project.featured && <Badge variant="accent"><Icon name="star" /> Destacado</Badge>}
                  {project.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="admin-portfolio__item-actions">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => handleToggleFeatured(project)}
                  loading={actionLoading === project.id}
                >
                  {project.featured ? <Icon name="star" /> : <Icon name="star" />}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => handleTogglePublish(project)}
                  loading={actionLoading === project.id}
                >
                  {project.published ? 'Despublicar' : 'Publicar'}
                </Button>
                <Link to={`/admin/portfolio/${project.id}`}>
                  <Button variant="secondary" size="sm">Editar</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(project)}>
                  <Icon name="trash" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar proyecto"
        size="sm"
      >
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
          ¿Seguro que quieres eliminar <strong>"{deleteTarget?.title}"</strong>?
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={!!actionLoading}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
