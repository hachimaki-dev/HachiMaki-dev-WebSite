/**
 * AdminFriendLinksPage.jsx — Admin control panel for link exchange (Linkeame)
 *
 * Provides CRUD operations for friendly website link banners,
 * including local file uploading to Supabase Storage and live previews of chosen animations.
 */

import { useState } from 'react'
import { useFriendLinksAdmin } from '../../../features/friends/useFriendLinksAdmin'
import { useToast } from '../../../components/ui/Toast'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Modal } from '../../../components/ui/Modal'
import './AdminFriendLinksPage.css'
import Icon from '../../../components/ui/Icon'

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Ninguno (Estático)' },
  { value: 'bounce', label: 'Rebote (Bounce)' },
  { value: 'rotate', label: 'Giro (Rotate)' },
  { value: 'pulse', label: 'Pulso (Pulse)' },
  { value: 'shake', label: 'Temblar (Shake)' },
  { value: 'float', label: 'Flotar (Float)' },
  { value: 'skew', label: 'Inclinado (Skew)' },
  { value: 'flash', label: 'Destello (Flash)' },
  { value: 'rainbow', label: 'Arcoíris (Rainbow)' },
]

export function AdminFriendLinksPage() {
  const { links, loading, error, create, update, remove, uploadBanner } = useFriendLinksAdmin()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null) // null for create, object for edit
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  /* Form State */
  const [form, setForm] = useState({
    name: '',
    url: '',
    image_url: '',
    animation_type: 'none',
    sort_order: 0,
  })

  /* Reset form state */
  const resetForm = (link = null) => {
    if (link) {
      setForm({
        name: link.name || '',
        url: link.url || '',
        image_url: link.image_url || '',
        animation_type: link.animation_type || 'none',
        sort_order: link.sort_order || 0,
      })
      setEditingLink(link)
    } else {
      setForm({
        name: '',
        url: '',
        image_url: '',
        animation_type: 'none',
        sort_order: links.length ? Math.max(...links.map(l => l.sort_order)) + 10 : 0,
      })
      setEditingLink(null)
    }
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (link) => {
    resetForm(link)
    setIsModalOpen(true)
  }

  const handleFormChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /* Handle file upload to Supabase Storage */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const publicUrl = await uploadBanner(file)
      setForm((prev) => ({ ...prev, image_url: publicUrl }))
      toast({ type: 'success', message: 'Imagen subida con éxito.' })
    } catch (err) {
      toast({ type: 'error', message: `Error de subida: ${err.message}` })
    } finally {
      setUploadingFile(false)
    }
  }

  /* Handle submit create or update */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim() || !form.image_url.trim()) {
      toast({ type: 'warning', message: 'Por favor rellena todos los campos requeridos.' })
      return
    }

    setSaving(true)
    try {
      if (editingLink) {
        await update(editingLink.id, form)
        toast({ type: 'success', message: 'Enlace web amigo actualizado.' })
      } else {
        await create(form)
        toast({ type: 'success', message: 'Enlace web amigo añadido.' })
      }
      setIsModalOpen(false)
    } catch (err) {
      toast({ type: 'error', message: `Error al guardar: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  /* Handle delete action */
  const handleDelete = async (link) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a "${link.name}" de tus webs amigas?`)) {
      return
    }

    try {
      await remove(link.id, link.image_url)
      toast({ type: 'success', message: 'Enlace eliminado correctamente.' })
    } catch (err) {
      toast({ type: 'error', message: `Error al eliminar: ${err.message}` })
    }
  }

  if (loading && links.length === 0) return <PageLoader />

  return (
    <div className="admin-links page-enter">
      <div className="admin-links__header">
        <div>
          <h1 className="admin-links__title">Webs Amigas &amp; Linkeame</h1>
          <p className="admin-links__subtitle">Gestiona los pequeños banners animados de la vitrina del footer</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Agregar Web Amiga
        </Button>
      </div>

      {error && (
        <div className="admin-links__error font-mono">
          <span>[ERROR] {error}</span>
        </div>
      )}

      {links.length === 0 ? (
        <div className="admin-links__empty">
          <p>No tienes webs amigas añadidas todavía.</p>
          <Button variant="outline" onClick={handleOpenCreate}>Añadir el primero</Button>
        </div>
      ) : (
        <div className="admin-links__table-wrapper">
          <table className="admin-links__table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Banner</th>
                <th>Nombre</th>
                <th>URL Destino</th>
                <th>Animación</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Orden</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div className="admin-links__preview-cell">
                      <div className={`admin-links__banner-container admin-links__banner-container--${link.animation_type}`}>
                        <img
                          src={link.image_url}
                          alt={link.name}
                          className="admin-links__banner-img"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="admin-links__font-bold">{link.name}</td>
                  <td className="admin-links__url-cell font-mono">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  </td>
                  <td>
                    <span className="admin-links__badge">
                      {ANIMATION_OPTIONS.find(o => o.value === link.animation_type)?.label || link.animation_type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }} className="font-mono">{link.sort_order}</td>
                  <td>
                    <div className="admin-links__actions">
                      <button
                        className="admin-links__action-btn"
                        onClick={() => handleOpenEdit(link)}
                        title="Editar enlace"
                      >
                        <Icon name="magic-edit" />
                      </button>
                      <button
                        className="admin-links__action-btn admin-links__action-btn--danger"
                        onClick={() => handleDelete(link)}
                        title="Eliminar enlace"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink ? 'Editar Web Amiga' : 'Añadir Web Amiga'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="admin-links__form">
          <div className="admin-links__form-layout">
            <div className="admin-links__form-fields">
              <Input
                label="Nombre de la web"
                value={form.name}
                onChange={handleFormChange('name')}
                placeholder="Ej. Pulpería Popular"
                required
              />

              <Input
                label="URL de destino"
                value={form.url}
                onChange={handleFormChange('url')}
                placeholder="Ej. https://pulperiapopular.cl"
                required
              />

              <div className="admin-links__field-group">
                <Input
                  label="URL del Banner (Imagen)"
                  value={form.image_url}
                  onChange={handleFormChange('image_url')}
                  placeholder="https://..."
                  required
                />
                <div className="admin-links__file-upload">
                  <label className="admin-links__file-label">
                    <span>{uploadingFile ? 'Subiendo...' : <><Icon name="folder" /> Subir Banner local</>}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="admin-links__file-input"
                    />
                  </label>
                </div>
              </div>

              <div className="admin-links__select-wrapper">
                <label className="admin-links__select-label">Tipo de Animación</label>
                <select
                  value={form.animation_type}
                  onChange={handleFormChange('animation_type')}
                  className="admin-links__select"
                >
                  {ANIMATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Orden de visualización"
                type="number"
                value={form.sort_order}
                onChange={handleFormChange('sort_order')}
                placeholder="0"
              />
            </div>

            {/* Premium Live Animation Preview Container */}
            <div className="admin-links__form-preview">
              <h3 className="admin-links__preview-title">Vista Previa</h3>
              <div className="admin-links__preview-box">
                {form.image_url ? (
                  <div className={`admin-links__preview-banner admin-links__preview-banner--${form.animation_type}`}>
                    <img
                      src={form.image_url}
                      alt="Banner Preview"
                      className="admin-links__preview-img"
                    />
                  </div>
                ) : (
                  <div className="admin-links__preview-placeholder">
                    <span>(Sin imagen)</span>
                  </div>
                )}
              </div>
              <p className="admin-links__preview-hint">
                Así se animará tu banner (88x31 px) en la sección de Webs Amigas.
              </p>
            </div>
          </div>

          <div className="admin-links__form-actions">
            <Button type="submit" variant="primary" loading={saving}>
              {editingLink ? 'Guardar Cambios' : 'Añadir Web Amiga'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
