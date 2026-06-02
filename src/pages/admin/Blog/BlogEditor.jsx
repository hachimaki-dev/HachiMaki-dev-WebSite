import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBlogAdmin } from '../../../features/blog/useBlogAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Modal } from '../../../components/ui/Modal'
import { slugify } from '../../../utils/slugify'
import { usePhotos } from '../../../features/photos/usePhotos'
import { ROUTES } from '../../../lib/constants'
import './BlogEditor.css'

export function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, create, update } = useBlogAdmin()
  const { toast } = useToast()

  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false)
  const { photos, loading: photosLoading } = usePhotos()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_url: '',
    published: false,
  })
  const [autoSlug, setAutoSlug] = useState(true)

  /* Load existing post for editing */
  useEffect(() => {
    if (!isEditing) return

    const loadPost = async () => {
      try {
        const post = await getById(id)
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          cover_url: post.cover_url || '',
          published: post.published || false,
        })
        setAutoSlug(false)
      } catch (err) {
        toast({ type: 'error', message: 'Error al cargar el post' })
        navigate(ROUTES.ADMIN_BLOG)
      }
      setLoading(false)
    }
    loadPost()
  }, [id, isEditing, getById, navigate, toast])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-generate slug from title
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
    setSaving(true)

    try {
      if (isEditing) {
        await update(id, form)
        toast({ type: 'success', message: 'Post actualizado' })
      } else {
        await create(form)
        toast({ type: 'success', message: 'Post creado' })
      }
      navigate(ROUTES.ADMIN_BLOG)
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="blog-editor page-enter">
      <div className="blog-editor__header">
        <h1 className="blog-editor__title">
          {isEditing ? 'Editar post' : 'Nuevo post'}
        </h1>
      </div>

      <form className="blog-editor__form" onSubmit={handleSubmit}>
        <div className="blog-editor__main">
          <Input
            label="Título"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Mi primer post"
            required
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="mi-primer-post"
            hint="URL del post: /blog/mi-primer-post"
            required
          />

          <Input
            label="Excerpt"
            value={form.excerpt}
            onChange={handleChange('excerpt')}
            placeholder="Un breve resumen del post..."
            textarea
            rows={3}
          />

          <Input
            label="Contenido (HTML)"
            value={form.content}
            onChange={handleChange('content')}
            placeholder="<h2>Introducción</h2><p>...</p>"
            textarea
            rows={16}
          />
        </div>

        <div className="blog-editor__sidebar">
          {/* Publish toggle */}
          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Publicación</h3>
            <label className="blog-editor__toggle">
              <input
                type="checkbox"
                checked={form.published}
                onChange={handleChange('published')}
              />
              <span className="blog-editor__toggle-slider"></span>
              <span>{form.published ? 'Publicado' : 'Borrador'}</span>
            </label>
          </div>

          {/* Cover URL */}
          <div className="blog-editor__section">
            <Input
              label="URL de portada"
              value={form.cover_url}
              onChange={handleChange('cover_url')}
              placeholder="https://..."
            />
            {form.cover_url && (
              <div className="blog-editor__preview-img">
                <img src={form.cover_url} alt="Preview" />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsPhotoPickerOpen(true)}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Seleccionar desde Fotos
            </Button>
          </div>

          {/* Photo Picker Modal */}
          <Modal
            open={isPhotoPickerOpen}
            onClose={() => setIsPhotoPickerOpen(false)}
            title="Seleccionar portada"
            size="lg"
          >
            {photosLoading ? (
              <PageLoader />
            ) : (
              <div className="blog-editor__photo-grid">
                {photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.publicUrl}
                    alt="Cover option"
                    className="blog-editor__photo-option"
                    onClick={() => {
                      handleChange('cover_url')({ target: { value: photo.publicUrl } })
                      setIsPhotoPickerOpen(false)
                    }}
                  />
                ))}
                {photos.length === 0 && <p>No hay fotos subidas en la galería.</p>}
              </div>
            )}
          </Modal>

          {/* Actions */}
          <div className="blog-editor__actions">
            <Button type="submit" variant="primary" fullWidth loading={saving}>
              {isEditing ? 'Guardar cambios' : 'Crear post'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate(ROUTES.ADMIN_BLOG)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
