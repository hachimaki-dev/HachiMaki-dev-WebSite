import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCoursesAdmin } from '../../../features/courses/useCoursesAdmin'
import { usePhotos } from '../../../features/photos/usePhotos'
import { usePhotosAdmin } from '../../../features/photos/usePhotosAdmin'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { ROUTES } from '../../../lib/constants'
import { slugify } from '../../../utils/slugify'
import Icon from '../../../components/ui/Icon'
import './CourseEditor.css'

export function CourseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, create, update, removeLesson, updateLesson } = useCoursesAdmin()
  const { toast } = useToast()
  
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState(null)
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_url: '',
    category: '',
    difficulty: 'Principiante',
    published: false
  })
  
  const [autoSlug, setAutoSlug] = useState(true)
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false)
  
  const { photos, loading: photosLoading } = usePhotos()
  const { uploadPhoto, isUploading } = usePhotosAdmin(() => {
    // Photos callback
  })

  useEffect(() => {
    if (!isEditing) return
    const loadCourse = async () => {
      try {
        const data = await getById(id)
        setCourse(data)
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          cover_url: data.cover_url || '',
          category: data.category || '',
          difficulty: data.difficulty || 'Principiante',
          published: data.published || false
        })
        setAutoSlug(false)
      } catch (err) {
        toast({ type: 'error', message: 'Error al cargar el curso' })
        navigate(ROUTES.ADMIN_COURSES)
      }
      setLoading(false)
    }
    loadCourse()
  }, [id, isEditing, getById, navigate, toast])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEditing) {
        await update(id, form)
        toast({ type: 'success', message: 'Curso actualizado con éxito' })
        navigate(ROUTES.ADMIN_COURSES)
      } else {
        const newCourse = await create(form)
        toast({ type: 'success', message: 'Curso creado. Añade lecciones ahora.' })
        navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', newCourse.id))
      }
    } catch (err) {
      toast({ type: 'error', message: err.message })
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la lección "${lessonTitle}"?`)) return
    try {
      await removeLesson(lessonId)
      toast({ type: 'success', message: 'Lección eliminada' })
      // Reload course
      const data = await getById(id)
      setCourse(data)
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
  }

  const handleToggleLesson = async (lessonId, currentStatus) => {
    try {
      await updateLesson(lessonId, { published: !currentStatus })
      toast({ type: 'success', message: !currentStatus ? 'Lección publicada' : 'Lección guardada como borrador' })
      // Reload course
      const data = await getById(id)
      setCourse(data)
    } catch (err) {
      toast({ type: 'error', message: err.message })
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploaded = await uploadPhoto(file)
      if (uploaded?.publicUrl) {
        setForm(prev => ({ ...prev, cover_url: uploaded.publicUrl }))
        setIsPhotoPickerOpen(false)
        toast({ type: 'success', message: 'Imagen subida y asignada como portada' })
      }
    } catch (err) {
      toast({ type: 'error', message: 'Error al subir la imagen' })
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="course-editor page-enter">
      <header className="course-editor__header">
        <div>
          <h1 className="course-editor__title">
            {isEditing ? 'Configurar Curso' : 'Crear Nuevo Curso'}
          </h1>
          <p className="admin-page__subtitle">
            {isEditing ? `Modificando: ${form.title}` : 'Establece los metadatos generales del curso'}
          </p>
        </div>
      </header>

      <div className="course-editor__layout">
        <form className="course-editor__form" onSubmit={handleSubmit}>
          <div className="course-editor__card">
            <h2 className="course-editor__section-heading">
              <Icon name="settings-2" /> Datos Generales
            </h2>
            
            <Input
              label="Título del Curso"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="ej: Introducción al Deep Learning"
              required
            />
            
            <Input
              label="Slug (URL)"
              value={form.slug}
              onChange={(e) => {
                setAutoSlug(false)
                setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))
              }}
              placeholder="ej: introduccion-al-deep-learning"
              required
            />
            
            <Input
              label="Descripción del Curso"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Escribe un resumen atractivo sobre lo que se aprenderá en este curso..."
              textarea
              rows={4}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input
                label="Categoría"
                value={form.category}
                onChange={handleChange('category')}
                placeholder="ej: IA, Programación"
              />
              <div className="input-group">
                <label className="input-label">Dificultad</label>
                <select 
                  className="input-field" 
                  value={form.difficulty}
                  onChange={handleChange('difficulty')}
                  style={{
                    backgroundColor: 'var(--color-bg-alt)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-2)',
                    width: '100%',
                    height: '42px'
                  }}
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="course-editor__cover-section">
              <Input
                label="URL de Portada"
                value={form.cover_url}
                onChange={handleChange('cover_url')}
                placeholder="https://..."
              />
              
              {form.cover_url && (
                <div className="course-editor__cover-preview">
                  <img src={form.cover_url} alt="Cover Preview" />
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPhotoPickerOpen(true)}
                style={{ marginTop: 'var(--space-2)' }}
              >
                <Icon name="image" /> Seleccionar desde Galería / Subir Foto
              </Button>
            </div>

            <div className="course-editor__publish-section" style={{ marginTop: 'var(--space-6)', borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <label className="blog-editor__toggle">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={handleChange('published')}
                />
                <span className="blog-editor__toggle-slider"></span>
                <span style={{ fontWeight: 'bold', color: form.published ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
                  {form.published ? 'CURSO PUBLICADO' : 'BORRADOR'}
                </span>
              </label>
            </div>

            <div className="course-editor__actions" style={{ marginTop: 'var(--space-6)' }}>
              <Button type="submit" variant="primary" loading={saving} style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)' }}>
                {isEditing ? 'Guardar Cambios' : 'Crear Curso'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_COURSES)}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>

        {isEditing && (
          <div className="course-editor__lessons">
            <div className="course-editor__lessons-header">
              <h2>
                <Icon name="book" /> Lecciones ({course?.course_lessons?.length || 0})
              </h2>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(ROUTES.ADMIN_COURSE_LESSON_NEW.replace(':id', id))}
                style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
              >
                + Añadir Lección
              </Button>
            </div>
            
            <div className="course-editor__lessons-list" style={{ marginTop: 'var(--space-4)' }}>
              {course?.course_lessons?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <p className="text-dim">No hay lecciones asociadas a este curso.</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate(ROUTES.ADMIN_COURSE_LESSON_NEW.replace(':id', id))}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    Añade la primera lección ahora
                  </Button>
                </div>
              ) : (
                course?.course_lessons?.map((lesson, idx) => (
                  <div key={lesson.id} className="course-lesson-item outsider__feed-item" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)' }}>
                    <div className="course-lesson-item__info">
                      <span className="course-lesson-item__number" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div style={{ marginLeft: 'var(--space-2)' }}>
                        <span 
                          className="course-lesson-item__title" 
                          style={{ fontWeight: 'bold', display: 'block', cursor: 'pointer' }}
                          onClick={() => navigate(ROUTES.ADMIN_COURSE_LESSON_EDIT.replace(':id', id).replace(':lessonId', lesson.id))}
                          title="Editar Lección"
                        >
                          {lesson.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {lesson.content_format === 'html' ? 'HTML' : 'Markdown'} &bull; {lesson.reading_time_min || 0} min
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`status-badge ${lesson.published ? 'status-badge--active' : 'status-badge--inactive'}`}
                        onClick={() => handleToggleLesson(lesson.id, lesson.published)}
                        title="Click para cambiar estado"
                        style={{ 
                          fontSize: '10px', 
                          marginLeft: 'auto', 
                          marginRight: 'var(--space-2)',
                        }}
                      >
                        <span className="status-badge__dot"></span>
                        {lesson.published ? 'Publicado' : 'Borrador'}
                      </button>
                    </div>
                    <div className="course-lesson-item__actions" style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(ROUTES.ADMIN_COURSE_LESSON_EDIT.replace(':id', id).replace(':lessonId', lesson.id))}
                        title="Editar Lección"
                      >
                        <Icon name="magic-edit" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        title="Eliminar Lección"
                      >
                        <Icon name="trash" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Picker Modal */}
      <Modal
        open={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        title="Seleccionar Portada"
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

        {photosLoading ? (
          <PageLoader />
        ) : (
          <div className="blog-editor__photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.publicUrl}
                alt="Option"
                className="blog-editor__photo-option"
                style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer', border: form.cover_url === photo.publicUrl ? '3px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                onClick={() => {
                  setForm(prev => ({ ...prev, cover_url: photo.publicUrl }))
                  setIsPhotoPickerOpen(false)
                  toast({ type: 'success', message: 'Portada seleccionada' })
                }}
              />
            ))}
            {photos.length === 0 && <p>No hay fotos subidas en la galería.</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
