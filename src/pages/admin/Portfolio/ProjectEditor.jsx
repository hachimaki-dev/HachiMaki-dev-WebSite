import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectsAdmin } from '../../../features/portfolio/useProjectsAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { slugify } from '../../../utils/slugify'
import { ROUTES } from '../../../lib/constants'
import './ProjectEditor.css'

export function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, create, update } = useProjectsAdmin()
  const { toast } = useToast()

  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    cover_url: '',
    repo_url: '',
    live_url: '',
    tags: [],
    featured: false,
    published: false,
    sort_order: 0,
  })
  const [tagsInput, setTagsInput] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    if (!isEditing) return

    const loadProject = async () => {
      try {
        const project = await getById(id)
        setForm({
          title: project.title || '',
          slug: project.slug || '',
          description: project.description || '',
          content: project.content || '',
          cover_url: project.cover_url || '',
          repo_url: project.repo_url || '',
          live_url: project.live_url || '',
          tags: project.tags || [],
          featured: project.featured || false,
          published: project.published || false,
          sort_order: project.sort_order || 0,
        })
        setTagsInput((project.tags || []).join(', '))
        setAutoSlug(false)
      } catch (err) {
        toast({ type: 'error', message: 'Error al cargar el proyecto' })
        navigate(ROUTES.ADMIN_PORTFOLIO)
      }
      setLoading(false)
    }
    loadProject()
  }, [id, isEditing, getById, navigate, toast])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
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

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value)
    const tags = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    setForm((prev) => ({ ...prev, tags }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditing) {
        await update(id, form)
        toast({ type: 'success', message: 'Proyecto actualizado' })
      } else {
        await create(form)
        toast({ type: 'success', message: 'Proyecto creado' })
      }
      navigate(ROUTES.ADMIN_PORTFOLIO)
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="project-editor page-enter">
      <div className="project-editor__header">
        <h1 className="project-editor__title">
          {isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h1>
      </div>

      <form className="project-editor__form" onSubmit={handleSubmit}>
        <div className="project-editor__main">
          <Input label="Título" value={form.title} onChange={handleChange('title')} placeholder="Mi proyecto" required />
          <Input label="Slug" value={form.slug} onChange={handleSlugChange} placeholder="mi-proyecto" required />
          <Input label="Descripción corta" value={form.description} onChange={handleChange('description')} placeholder="Breve descripción..." textarea rows={3} />
          <Input label="Contenido (HTML)" value={form.content} onChange={handleChange('content')} placeholder="<h2>Sobre el proyecto</h2>" textarea rows={12} />

          <div className="project-editor__row">
            <Input label="Repositorio URL" value={form.repo_url} onChange={handleChange('repo_url')} placeholder="https://github.com/..." />
            <Input label="Demo URL" value={form.live_url} onChange={handleChange('live_url')} placeholder="https://..." />
          </div>

          <Input label="Tags (separados por coma)" value={tagsInput} onChange={handleTagsChange} placeholder="React, Node.js, PostgreSQL" />
        </div>

        <div className="project-editor__sidebar">
          <div className="project-editor__section">
            <h3 className="project-editor__section-title">Publicación</h3>
            <label className="blog-editor__toggle">
              <input type="checkbox" checked={form.published} onChange={handleChange('published')} />
              <span className="blog-editor__toggle-slider"></span>
              <span>{form.published ? 'Publicado' : 'Borrador'}</span>
            </label>
          </div>

          <div className="project-editor__section">
            <h3 className="project-editor__section-title">Destacado</h3>
            <label className="blog-editor__toggle">
              <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} />
              <span className="blog-editor__toggle-slider"></span>
              <span>{form.featured ? 'Destacado' : 'Normal'}</span>
            </label>
          </div>

          <div className="project-editor__section">
            <Input label="URL de portada" value={form.cover_url} onChange={handleChange('cover_url')} placeholder="https://..." />
            {form.cover_url && (
              <div className="blog-editor__preview-img" style={{ marginTop: 'var(--space-3)' }}>
                <img src={form.cover_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="project-editor__section">
            <Input label="Orden" type="number" value={form.sort_order} onChange={handleChange('sort_order')} hint="Menor número = aparece primero" />
          </div>

          <div className="project-editor__actions">
            <Button type="submit" variant="primary" fullWidth loading={saving}>
              {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => navigate(ROUTES.ADMIN_PORTFOLIO)}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
