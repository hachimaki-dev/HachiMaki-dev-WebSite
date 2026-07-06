import { useState } from 'react'
import { useBlogTagsAdmin } from '../../../features/blog/useBlogTagsAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Modal } from '../../../components/ui/Modal'
import { slugify } from '../../../utils/slugify'
import './AdminBlogPage.css' // We can reuse the list styles
import Icon from '../../../components/ui/Icon'

export function AdminTagsPage() {
  const { tags, loading, create, update, remove } = useBlogTagsAdmin()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({ name: '', slug: '', color: '#8b5cf6' })
  const [autoSlug, setAutoSlug] = useState(true)

  const openNew = () => {
    setEditingTag(null)
    setForm({ name: '', slug: '', color: '#8b5cf6' })
    setAutoSlug(true)
    setIsModalOpen(true)
  }

  const openEdit = (tag) => {
    setEditingTag(tag)
    setForm({ name: tag.name, slug: tag.slug, color: tag.color || '#8b5cf6' })
    setAutoSlug(false)
    setIsModalOpen(true)
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && autoSlug) {
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
      if (editingTag) {
        await update(editingTag.id, form)
        toast({ type: 'success', message: 'Tag actualizado' })
      } else {
        await create(form)
        toast({ type: 'success', message: 'Tag creado' })
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
      toast({ type: 'success', message: 'Tag eliminado' })
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
          <h1 className="admin-blog__title">Tags de Blog</h1>
          <p className="admin-blog__subtitle">{tags.length} tags en total</p>
        </div>
        <Button variant="primary" onClick={openNew}>+ Nuevo Tag</Button>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={<Icon name="bookmark" />}
          title="Sin tags"
          description="Aún no has creado tags para el blog."
          action={<Button variant="outline" onClick={openNew}>Crear el primero</Button>}
        />
      ) : (
        <div className="admin-blog__list">
          {tags.map((tag) => (
            <div key={tag.id} className="admin-blog__item">
              <div className="admin-blog__item-info" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: tag.color || '#8b5cf6'
                }}></span>
                <div>
                  <div className="admin-blog__item-title">{tag.name}</div>
                  <div className="admin-blog__item-date">/{tag.slug}</div>
                </div>
              </div>
              <div className="admin-blog__item-actions">
                <Button variant="ghost" size="sm" onClick={() => openEdit(tag)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(tag)}>
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
        title={editingTag ? 'Editar Tag' : 'Nuevo Tag'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nombre"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={handleSlugChange}
            required
          />
          <Input
            label="Color"
            type="color"
            value={form.color}
            onChange={handleChange('color')}
            required
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading} fullWidth>
              {editingTag ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar tag?"
        size="sm"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
          Esta acción no se puede deshacer. Los posts asociados a este tag dejarán de tenerlo.
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
