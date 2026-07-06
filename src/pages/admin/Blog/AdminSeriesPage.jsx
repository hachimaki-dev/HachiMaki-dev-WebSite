import { useState } from 'react'
import { useBlogSeriesAdmin } from '../../../features/blog/useBlogSeriesAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Modal } from '../../../components/ui/Modal'
import { slugify } from '../../../utils/slugify'
import './AdminBlogPage.css' // Reusing styles
import Icon from '../../../components/ui/Icon'

export function AdminSeriesPage() {
  const { series, loading, create, update, remove } = useBlogSeriesAdmin()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({ title: '', slug: '', description: '' })
  const [autoSlug, setAutoSlug] = useState(true)

  const openNew = () => {
    setEditingSeries(null)
    setForm({ title: '', slug: '', description: '' })
    setAutoSlug(true)
    setIsModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingSeries(item)
    setForm({ title: item.title, slug: item.slug, description: item.description || '' })
    setAutoSlug(false)
    setIsModalOpen(true)
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && autoSlug) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSlugChange = (e) => {
    setAutoSlug(false)
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)

    try {
      if (editingSeries) {
        await update(editingSeries.id, form)
        toast({ type: 'success', message: 'Serie actualizada' })
      } else {
        await create(form)
        toast({ type: 'success', message: 'Serie creada' })
      }
      setIsModalOpen(false)
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await remove(deleteTarget.id)
      toast({ type: 'success', message: 'Serie eliminada' })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setDeleteTarget(null)
    setActionLoading(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="admin-blog page-enter">
      <div className="admin-blog__header">
        <div>
          <h1 className="admin-blog__title">Series de Blog</h1>
          <p className="admin-blog__subtitle">{series.length} series en total</p>
        </div>
        <Button variant="primary" onClick={openNew}>+ Nueva Serie</Button>
      </div>

      {series.length === 0 ? (
        <EmptyState
          icon={<Icon name="notebook" />}
          title="Sin series"
          description="Aún no has creado series para agrupar posts."
          action={<Button variant="outline" onClick={openNew}>Crear la primera</Button>}
        />
      ) : (
        <div className="admin-blog__list">
          {series.map((item) => (
            <div key={item.id} className="admin-blog__item">
              <div className="admin-blog__item-info">
                <div className="admin-blog__item-title">{item.title}</div>
                <div className="admin-blog__item-meta">
                  <span>/{item.slug}</span>
                  {item.description && (
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                      — {item.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="admin-blog__item-actions">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(item)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSeries ? 'Editar Serie' : 'Nueva Serie'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Título"
            value={form.title}
            onChange={handleChange('title')}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={handleSlugChange}
            required
          />
          <Input
            label="Descripción"
            value={form.description}
            onChange={handleChange('description')}
            textarea
            rows={2}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading} fullWidth>
              {editingSeries ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar serie?"
        size="sm"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
          Esta acción no se puede deshacer. Los posts asociados a esta serie quedarán sueltos.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)} fullWidth>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} loading={actionLoading} fullWidth>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
