import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBlogAdmin } from '../../../features/blog/useBlogAdmin'
import { useBlogTagsAdmin } from '../../../features/blog/useBlogTagsAdmin'
import { useBlogSeriesAdmin } from '../../../features/blog/useBlogSeriesAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Modal } from '../../../components/ui/Modal'
import { MarkdownRenderer } from '../../../components/blog/MarkdownRenderer'
import { slugify } from '../../../utils/slugify'
import { usePhotos } from '../../../features/photos/usePhotos'
import { usePhotosAdmin } from '../../../features/photos/usePhotosAdmin'
import { ROUTES } from '../../../lib/constants'
import './BlogEditor.css'
import Icon from '../../../components/ui/Icon'

export function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, create, update } = useBlogAdmin()
  const { tags: allTags, create: createTag } = useBlogTagsAdmin()
  const { series: allSeries } = useBlogSeriesAdmin()
  const { toast } = useToast()

  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const { photos, loading: photosLoading } = usePhotos()
  const { uploadPhoto, isUploading } = usePhotosAdmin(() => {
    // We could refetch photos here if we had a refetch function
    // For now we'll just wait for the subscription or reload.
  })
  
  // Photo Picker State
  const [photoPickerTarget, setPhotoPickerTarget] = useState(null) // 'cover' | 'editor'
  const [selectedEditorPhotos, setSelectedEditorPhotos] = useState([])
  const [editorImageLayout, setEditorImageLayout] = useState('standard') // 'standard' | 'small'
  const autoSaveTimerRef = useRef(null)
  const lastSavedRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_url: '',
    published: false,
    content_format: 'markdown',
    featured: false,
    series_id: '',
    series_order: 0,
  })
  const [selectedTagIds, setSelectedTagIds] = useState([])
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
          content_format: post.content_format || 'html',
          featured: post.featured || false,
          series_id: post.series_id || '',
          series_order: post.series_order || 0,
        })
        setSelectedTagIds((post.tags || []).map(t => t.id))
        setAutoSlug(false)
      } catch (err) {
        toast({ type: 'error', message: 'Error al cargar el post' })
        navigate(ROUTES.ADMIN_BLOG)
      }
      setLoading(false)
    }
    loadPost()
  }, [id, isEditing, getById, navigate, toast])

  /* Auto-save draft every 30s (only for editing existing posts) */
  const autoSave = useCallback(async () => {
    if (!isEditing || form.published) return
    const formStr = JSON.stringify(form)
    if (formStr === lastSavedRef.current) return

    try {
      await update(id, { ...form, series_id: form.series_id || null }, selectedTagIds)
      lastSavedRef.current = formStr
      toast({ type: 'info', message: 'Borrador guardado automáticamente' })
    } catch {
      // Silent fail for auto-save
    }
  }, [isEditing, id, form, selectedTagIds, update, toast])

  useEffect(() => {
    if (!isEditing) return
    autoSaveTimerRef.current = setInterval(autoSave, 30000)
    return () => clearInterval(autoSaveTimerRef.current)
  }, [isEditing, autoSave])

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

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const tag = await createTag({ name: newTagName.trim() })
      setSelectedTagIds(prev => [...prev, tag.id])
      setNewTagName('')
      toast({ type: 'success', message: `Tag "${tag.name}" creado` })
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
  }

  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('.blog-editor__content-area')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)

    let replacement = ''
    switch (syntax) {
      case 'bold': replacement = `**${selected || 'texto'}**`; break
      case 'italic': replacement = `*${selected || 'texto'}*`; break
      case 'h2': replacement = `\n## ${selected || 'Título'}\n`; break
      case 'h3': replacement = `\n### ${selected || 'Subtítulo'}\n`; break
      case 'code': replacement = selected.includes('\n')
        ? `\n\`\`\`\n${selected}\n\`\`\`\n`
        : `\`${selected || 'código'}\``; break
      case 'link': replacement = `[${selected || 'texto'}](url)`; break
      case 'image': 
        setPhotoPickerTarget('editor')
        setSelectedEditorPhotos([])
        setEditorImageLayout('standard')
        return // Return early, don't insert dummy markdown yet
      case 'list': replacement = `\n- ${selected || 'Item'}\n- Item 2\n- Item 3\n`; break
      case 'quote': replacement = `\n> ${selected || 'Cita'}\n`; break
      default: return
    }

    const newContent = form.content.substring(0, start) + replacement + form.content.substring(end)
    setForm(prev => ({ ...prev, content: newContent }))

    // Restore cursor after React re-render
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploadedPhoto = await uploadPhoto(file)
    if (uploadedPhoto && uploadedPhoto.publicUrl) {
      if (photoPickerTarget === 'cover') {
        handleChange('cover_url')({ target: { value: uploadedPhoto.publicUrl } })
        setPhotoPickerTarget(null)
      } else if (photoPickerTarget === 'editor') {
        // Automatically select it if we are in editor mode
        setSelectedEditorPhotos(prev => [...prev, uploadedPhoto])
      }
    }
  }

  const handleInsertEditorPhotos = () => {
    if (selectedEditorPhotos.length === 0) return

    let markdownToInsert = ''
    
    if (selectedEditorPhotos.length === 1) {
      // Single photo
      const photo = selectedEditorPhotos[0]
      if (editorImageLayout === 'small') {
        markdownToInsert = `![Imagen](${photo.publicUrl} "layout:small")\n`
      } else {
        markdownToInsert = `![Imagen](${photo.publicUrl})\n`
      }
    } else {
      // Gallery / Grid
      markdownToInsert = '\n' + selectedEditorPhotos.map(p => `![Imagen](${p.publicUrl})`).join(' ') + '\n'
    }

    const textarea = document.querySelector('.blog-editor__content-area')
    if (!textarea) return

    const start = textarea.selectionStart
    const newContent = form.content.substring(0, start) + markdownToInsert + form.content.substring(textarea.selectionEnd)
    
    setForm(prev => ({ ...prev, content: newContent }))
    setPhotoPickerTarget(null)
    setSelectedEditorPhotos([])
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + markdownToInsert.length, start + markdownToInsert.length)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const postData = {
        ...form,
        series_id: form.series_id || null,
      }

      if (isEditing) {
        await update(id, postData, selectedTagIds)
        toast({ type: 'success', message: 'Post actualizado' })
      } else {
        await create(postData, selectedTagIds)
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
        <div className="blog-editor__header-actions">
          <Button
            type="button"
            variant={showPreview ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <><Icon name="magic-edit" /> Editor</> : <><Icon name="eye" /> Preview</>}
          </Button>
        </div>
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

          {/* Markdown toolbar */}
          {!showPreview && (
            <div className="blog-editor__toolbar">
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('bold')} title="Negrita">
                <strong>B</strong>
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('italic')} title="Itálica">
                <em>I</em>
              </button>
              <span className="blog-editor__tool-sep"></span>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('h2')} title="Heading 2">
                H2
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('h3')} title="Heading 3">
                H3
              </button>
              <span className="blog-editor__tool-sep"></span>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('code')} title="Código">
                {'</>'}
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('link')} title="Link">
                <Icon name="link" />
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('image')} title="Imagen">
                <Icon name="image" />
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('list')} title="Lista">
                <Icon name="menu" />
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertMarkdown('quote')} title="Cita">
                <Icon name="quote-text-inline" />
              </button>
            </div>
          )}

          {/* Editor / Preview toggle */}
          {showPreview ? (
            <div className="blog-editor__preview">
              <MarkdownRenderer
                content={form.content}
                format={form.content_format}
              />
            </div>
          ) : (
            <textarea
              className="blog-editor__content-area"
              value={form.content}
              onChange={handleChange('content')}
              placeholder={form.content_format === 'markdown'
                ? '## Introducción\n\nEscribí tu post en Markdown...\n\n```javascript\nconsole.log("hola")\n```'
                : '<h2>Introducción</h2><p>...</p>'
              }
              rows={20}
            />
          )}
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
            <label className="blog-editor__toggle" style={{ marginTop: 'var(--space-3)' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={handleChange('featured')}
              />
              <span className="blog-editor__toggle-slider"></span>
              <span>Destacado</span>
            </label>
          </div>

          {/* Content format */}
          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Formato</h3>
            <div className="blog-editor__format-btns">
              <button
                type="button"
                className={`blog-editor__format-btn ${form.content_format === 'markdown' ? 'blog-editor__format-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, content_format: 'markdown' }))}
              >
                Markdown
              </button>
              <button
                type="button"
                className={`blog-editor__format-btn ${form.content_format === 'html' ? 'blog-editor__format-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, content_format: 'html' }))}
              >
                HTML
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Tags</h3>
            <div className="blog-editor__tags-list">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`blog-editor__tag-chip ${selectedTagIds.includes(tag.id) ? 'blog-editor__tag-chip--active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                  style={{ '--tag-color': tag.color || 'var(--color-accent)' }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="blog-editor__tag-create">
              <input
                type="text"
                className="blog-editor__tag-input"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nuevo tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
              />
              <button
                type="button"
                className="blog-editor__tag-add"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                +
              </button>
            </div>
          </div>

          {/* Series */}
          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Serie</h3>
            <select
              className="blog-editor__select"
              value={form.series_id}
              onChange={handleChange('series_id')}
            >
              <option value="">Sin serie</option>
              {allSeries.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {form.series_id && (
              <Input
                label="Orden en la serie"
                type="number"
                value={form.series_order}
                onChange={handleChange('series_order')}
                style={{ marginTop: 'var(--space-3)' }}
              />
            )}
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
              onClick={() => setPhotoPickerTarget('cover')}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Seleccionar desde Fotos
            </Button>
          </div>

          {/* Photo Picker Modal */}
          <Modal
            open={!!photoPickerTarget}
            onClose={() => {
              setPhotoPickerTarget(null)
              setSelectedEditorPhotos([])
            }}
            title={photoPickerTarget === 'cover' ? 'Seleccionar portada' : 'Insertar imagen en post'}
            size="lg"
          >
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                disabled={isUploading}
                style={{ fontSize: '14px' }}
              />
              {isUploading && <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Subiendo...</span>}
            </div>

            {photoPickerTarget === 'editor' && selectedEditorPhotos.length > 0 && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {selectedEditorPhotos.length} foto(s) seleccionadas
                </div>
                {selectedEditorPhotos.length === 1 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ marginRight: '1rem' }}>
                      <input 
                        type="radio" 
                        name="layout" 
                        value="standard" 
                        checked={editorImageLayout === 'standard'} 
                        onChange={() => setEditorImageLayout('standard')} 
                      /> Estándar
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="layout" 
                        value="small" 
                        checked={editorImageLayout === 'small'} 
                        onChange={() => setEditorImageLayout('small')} 
                      /> Pequeño
                    </label>
                  </div>
                )}
                {selectedEditorPhotos.length > 1 && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '1rem' }}>
                    Se insertarán agrupadas como una Galería/Grilla de fotos automáticamente.
                  </p>
                )}
                <Button type="button" variant="primary" onClick={handleInsertEditorPhotos}>
                  Insertar en el texto
                </Button>
              </div>
            )}

            {photosLoading ? (
              <PageLoader />
            ) : (
              <div className="blog-editor__photo-grid">
                {photos.map((photo) => {
                  const isSelected = selectedEditorPhotos.find(p => p.id === photo.id)
                  return (
                    <img
                      key={photo.id}
                      src={photo.publicUrl}
                      alt="Opcion"
                      className={`blog-editor__photo-option ${isSelected ? 'blog-editor__photo-option--selected' : ''}`}
                      style={{ border: isSelected ? '3px solid var(--color-accent)' : 'none' }}
                      onClick={() => {
                        if (photoPickerTarget === 'cover') {
                          handleChange('cover_url')({ target: { value: photo.publicUrl } })
                          setPhotoPickerTarget(null)
                        } else {
                          setSelectedEditorPhotos(prev => 
                            prev.find(p => p.id === photo.id)
                              ? prev.filter(p => p.id !== photo.id)
                              : [...prev, photo]
                          )
                        }
                      }}
                    />
                  )
                })}
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
