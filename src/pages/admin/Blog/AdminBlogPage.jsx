import { Link } from 'react-router-dom'
import { useBlogAdmin } from '../../../features/blog/useBlogAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Modal } from '../../../components/ui/Modal'
import { formatDate } from '../../../utils/formatDate'
import { ROUTES } from '../../../lib/constants'
import { useState } from 'react'
import './AdminBlogPage.css'

export function AdminBlogPage() {
  const { posts, loading, togglePublished, remove } = useBlogAdmin()
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const handleTogglePublish = async (post) => {
    setActionLoading(post.id)
    try {
      await togglePublished(post.id, !post.published)
      toast({
        type: 'success',
        message: post.published ? 'Post despublicado' : 'Post publicado',
      })
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
      toast({ type: 'success', message: 'Post eliminado' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setDeleteTarget(null)
    setActionLoading(null)
  }

  if (loading) return <PageLoader />

  return (
    <div className="admin-blog page-enter">
      <div className="admin-blog__header">
        <div>
          <h1 className="admin-blog__title">Blog Posts</h1>
          <p className="admin-blog__subtitle">{posts.length} posts en total</p>
        </div>
        <Link to={ROUTES.ADMIN_BLOG_NEW}>
          <Button variant="primary">+ Nuevo post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Sin posts"
          description="Crea tu primer post del blog."
          action={
            <Link to={ROUTES.ADMIN_BLOG_NEW}>
              <Button variant="primary">Crear post</Button>
            </Link>
          }
        />
      ) : (
        <div className="admin-blog__list">
          {posts.map((post) => (
            <div key={post.id} className="admin-blog__item">
              <div className="admin-blog__item-info">
                <Link to={`/admin/blog/${post.id}`} className="admin-blog__item-title">
                  {post.title}
                </Link>
                <div className="admin-blog__item-meta">
                  <Badge variant={post.published ? 'success' : 'default'}>
                    {post.published ? 'Publicado' : 'Borrador'}
                  </Badge>
                  <span className="admin-blog__item-date">
                    {formatDate(post.updated_at || post.created_at, { relative: true })}
                  </span>
                </div>
              </div>
              <div className="admin-blog__item-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  loading={actionLoading === post.id}
                  onClick={() => handleTogglePublish(post)}
                >
                  {post.published ? 'Despublicar' : 'Publicar'}
                </Button>
                <Link to={`/admin/blog/${post.id}`}>
                  <Button variant="secondary" size="sm">Editar</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(post)}
                >
                  🗑
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar post"
        size="sm"
      >
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
          ¿Seguro que quieres eliminar <strong>"{deleteTarget?.title}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={!!actionLoading}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
