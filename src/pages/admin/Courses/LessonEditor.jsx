import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCoursesAdmin } from '../../../features/courses/useCoursesAdmin'
import { usePhotos } from '../../../features/photos/usePhotos'
import { usePhotosAdmin } from '../../../features/photos/usePhotosAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Modal } from '../../../components/ui/Modal'
import { MarkdownRenderer } from '../../../components/blog/MarkdownRenderer'
import { slugify } from '../../../utils/slugify'
import { ROUTES } from '../../../lib/constants'
import Icon from '../../../components/ui/Icon'
import '../Blog/BlogEditor.css' // Reuse blog editor styles

export function LessonEditor() {
  const { id: courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { getLessonById, createLesson, updateLesson } = useCoursesAdmin()
  const { toast } = useToast()

  const isEditing = !!lessonId

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // Photo Picker State
  const [photoPickerTarget, setPhotoPickerTarget] = useState(null) // null | 'editor'
  const [selectedEditorPhotos, setSelectedEditorPhotos] = useState([])
  const [editorImageLayout, setEditorImageLayout] = useState('standard') // 'standard' | 'small'

  const { photos, loading: photosLoading } = usePhotos()
  const { uploadPhoto, isUploading } = usePhotosAdmin()

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    content_format: 'markdown',
    video_url: '',
    published: false,
  })
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    if (!isEditing) return
    const loadLesson = async () => {
      try {
        const data = await getLessonById(lessonId)
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          content_format: data.content_format || 'markdown',
          video_url: data.video_url || '',
          published: data.published || false,
        })
        setAutoSlug(false)
      } catch (err) {
        toast({ type: 'error', message: 'Error al cargar la lección' })
        navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', courseId))
      }
      setLoading(false)
    }
    loadLesson()
  }, [lessonId, isEditing, getLessonById, navigate, courseId, toast])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && autoSlug) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const insertSyntax = (syntax) => {
    const textarea = document.querySelector('.blog-editor__content-area')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)
    const isHtml = form.content_format === 'html'

    let replacement = ''
    switch (syntax) {
      case 'bold':
        replacement = isHtml 
          ? `<strong>${selected || 'texto'}</strong>`
          : `**${selected || 'texto'}**`
        break
      case 'italic':
        replacement = isHtml
          ? `<em>${selected || 'texto'}</em>`
          : `*${selected || 'texto'}*`
        break
      case 'h2':
        replacement = isHtml
          ? `<h2>${selected || 'Título'}</h2>\n`
          : `\n## ${selected || 'Título'}\n`
        break
      case 'h3':
        replacement = isHtml
          ? `<h3>${selected || 'Subtítulo'}</h3>\n`
          : `\n### ${selected || 'Subtítulo'}\n`
        break
      case 'code':
        if (selected.includes('\n')) {
          replacement = isHtml
            ? `<pre><code>\n${selected}\n</code></pre>\n`
            : `\n\`\`\`\n${selected}\n\`\`\`\n`
        } else {
          replacement = isHtml
            ? `<code>${selected || 'código'}</code>`
            : `\`${selected || 'código'}\``
        }
        break
      case 'link':
        replacement = isHtml
          ? `<a href="url">${selected || 'texto'}</a>`
          : `[${selected || 'texto'}](url)`
        break
      case 'image':
        setPhotoPickerTarget('editor')
        setSelectedEditorPhotos([])
        setEditorImageLayout('standard')
        return
      default:
        return
    }

    const newContent = form.content.substring(0, start) + replacement + form.content.substring(end)
    setForm(prev => ({ ...prev, content: newContent }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedPhoto = await uploadPhoto(file)
      if (uploadedPhoto && uploadedPhoto.publicUrl) {
        setSelectedEditorPhotos(prev => [...prev, uploadedPhoto])
        toast({ type: 'success', message: 'Imagen subida a la galería' })
      }
    } catch (err) {
      toast({ type: 'error', message: 'Error al subir la foto' })
    }
  }

  const handleInsertEditorPhotos = () => {
    if (selectedEditorPhotos.length === 0) return

    const isHtml = form.content_format === 'html'
    let textToInsert = ''
    
    if (selectedEditorPhotos.length === 1) {
      const photo = selectedEditorPhotos[0]
      if (isHtml) {
        const layoutClass = editorImageLayout === 'small' ? 'blog-image blog-image--small' : 'blog-image'
        textToInsert = `<img src="${photo.publicUrl}" alt="Imagen" class="${layoutClass}" />\n`
      } else {
        if (editorImageLayout === 'small') {
          textToInsert = `![Imagen](${photo.publicUrl} "layout:small")\n`
        } else {
          textToInsert = `![Imagen](${photo.publicUrl})\n`
        }
      }
    } else {
      // Gallery / Grid
      if (isHtml) {
        textToInsert = `\n<div class="blog-gallery">\n  ` + 
          selectedEditorPhotos.map(p => `<img src="${p.publicUrl}" alt="Imagen" class="blog-image" />`).join('\n  ') + 
          `\n</div>\n`
      } else {
        textToInsert = '\n' + selectedEditorPhotos.map(p => `![Imagen](${p.publicUrl})`).join(' ') + '\n'
      }
    }

    const textarea = document.querySelector('.blog-editor__content-area')
    if (!textarea) return

    const start = textarea.selectionStart
    const newContent = form.content.substring(0, start) + textToInsert + form.content.substring(textarea.selectionEnd)
    
    setForm(prev => ({ ...prev, content: newContent }))
    setPhotoPickerTarget(null)
    setSelectedEditorPhotos([])
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEditing) {
        await updateLesson(lessonId, form)
        toast({ type: 'success', message: 'Lección actualizada con éxito' })
      } else {
        await createLesson({ ...form, course_id: courseId })
        toast({ type: 'success', message: 'Lección creada' })
      }
      navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', courseId))
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="blog-editor page-enter">
      <div className="blog-editor__header">
        <div>
          <h1 className="blog-editor__title">
            {isEditing ? 'Editar Lección' : 'Nueva Lección'}
          </h1>
          <p className="admin-page__subtitle">Edita el contenido didáctico de tu lección</p>
        </div>
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
            label="Título de Lección"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="ej: 1. Primeros pasos con React"
            required
          />
          
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setAutoSlug(false)
              setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))
            }}
            placeholder="ej: primeros-pasos-con-react"
            required
          />
          
          <Input
            label="Resumen / Extracto de la lección"
            value={form.excerpt}
            onChange={handleChange('excerpt')}
            placeholder="Introduce de forma sintética de qué trata esta lección..."
            textarea
            rows={2}
          />
          
          <Input
            label="URL Video de YouTube (opcional)"
            value={form.video_url}
            onChange={handleChange('video_url')}
            placeholder="ej: https://youtube.com/watch?v=..."
          />

          {!showPreview && (
            <div className="blog-editor__toolbar">
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('bold')} title="Negrita">
                <strong>B</strong>
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('italic')} title="Cursiva">
                <em>I</em>
              </button>
              <span className="blog-editor__tool-sep"></span>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('h2')} title="Encabezado 2">
                H2
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('h3')} title="Encabezado 3">
                H3
              </button>
              <span className="blog-editor__tool-sep"></span>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('code')} title="Código">
                {'</>'}
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('link')} title="Enlace">
                <Icon name="link" />
              </button>
              <button type="button" className="blog-editor__tool" onClick={() => insertSyntax('image')} title="Insertar Imagen">
                <Icon name="image" />
              </button>
            </div>
          )}

          {showPreview ? (
            <div className="blog-editor__preview">
              <MarkdownRenderer content={form.content} format={form.content_format} />
            </div>
          ) : (
            <textarea
              className="blog-editor__content-area"
              value={form.content}
              onChange={handleChange('content')}
              placeholder={form.content_format === 'markdown' 
                ? 'Escribe tu lección usando Markdown...' 
                : 'Escribe tu lección usando código HTML...'
              }
              rows={20}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
            />
          )}
        </div>

        <div className="blog-editor__sidebar">
          {/* Formato */}
          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Formato de Contenido</h3>
            <div className="blog-editor__format-btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <button
                type="button"
                className={`blog-editor__format-btn ${form.content_format === 'markdown' ? 'blog-editor__format-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, content_format: 'markdown' }))}
                style={{
                  padding: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: form.content_format === 'markdown' ? 'var(--color-accent)' : 'transparent',
                  color: form.content_format === 'markdown' ? 'var(--color-bg)' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                Markdown
              </button>
              <button
                type="button"
                className={`blog-editor__format-btn ${form.content_format === 'html' ? 'blog-editor__format-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, content_format: 'html' }))}
                style={{
                  padding: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: form.content_format === 'html' ? 'var(--color-accent)' : 'transparent',
                  color: form.content_format === 'html' ? 'var(--color-bg)' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                HTML
              </button>
            </div>
          </div>

          <div className="blog-editor__section">
            <h3 className="blog-editor__section-title">Estado de Publicación</h3>
            <label className="blog-editor__toggle">
              <input
                type="checkbox"
                checked={form.published}
                onChange={handleChange('published')}
              />
              <span className="blog-editor__toggle-slider"></span>
              <span style={{ fontWeight: 'bold', color: form.published ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
                {form.published ? 'LECCIÓN PUBLICADA' : 'BORRADOR'}
              </span>
            </label>
          </div>

          <div className="blog-editor__actions">
            <Button type="submit" variant="primary" fullWidth loading={saving}>
              {isEditing ? 'Guardar Cambios' : 'Crear Lección'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', courseId))}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>

      {/* Photo Picker Modal */}
      <Modal
        open={photoPickerTarget === 'editor'}
        onClose={() => {
          setPhotoPickerTarget(null)
          setSelectedEditorPhotos([])
        }}
        title="Insertar Imagen en Lección"
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

        {selectedEditorPhotos.length > 0 && (
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
            <Button type="button" variant="primary" onClick={handleInsertEditorPhotos}>
              Insertar en la Lección
            </Button>
          </div>
        )}

        {photosLoading ? (
          <PageLoader />
        ) : (
          <div className="blog-editor__photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {photos.map((photo) => {
              const isSelected = selectedEditorPhotos.find(p => p.id === photo.id)
              return (
                <img
                  key={photo.id}
                  src={photo.publicUrl}
                  alt="Option"
                  className="blog-editor__photo-option"
                  style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer', border: isSelected ? '3px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => {
                    setSelectedEditorPhotos(prev => 
                      prev.find(p => p.id === photo.id)
                        ? prev.filter(p => p.id !== photo.id)
                        : [...prev, photo]
                    )
                  }}
                />
              )
            })}
            {photos.length === 0 && <p>No hay fotos subidas en la galería.</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
