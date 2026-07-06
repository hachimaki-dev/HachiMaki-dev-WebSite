import { useState } from 'react'
import { useContactAdmin } from '../../../features/contact/useContactAdmin'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useToast } from '../../../components/ui/Toast'
import { formatDate } from '../../../utils/formatDate'
import './AdminContactPage.css'
import Icon from '../../../components/ui/Icon'

export function AdminContactPage() {
  const { messages, loading, error, markAsRead, remove } = useContactAdmin()
  const { toast } = useToast()
  
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState(null)

  if (loading) return <PageLoader />

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.is_read
    if (filter === 'read') return msg.is_read
    return true
  })

  const handleToggleRead = async (msg) => {
    try {
      await markAsRead(msg.id, !msg.is_read)
      toast({
        type: 'success',
        message: msg.is_read ? 'Mensaje marcado como no leído.' : 'Mensaje marcado como leído.',
      })
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage((prev) => ({ ...prev, is_read: !msg.is_read }))
      }
    } catch (err) {
      toast({ type: 'error', message: `Error: ${err.message}` })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta transmisión permanentemente?')) {
      return
    }

    try {
      await remove(id)
      toast({ type: 'success', message: 'Transmisión eliminada del servidor.' })
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      toast({ type: 'error', message: `Error: ${err.message}` })
    }
  }

  return (
    <div className="admin-contact page-enter">
      <div className="admin-contact__header">
        <div>
          <h1 className="admin-contact__title">Buzón de Disidencia</h1>
          <p className="admin-contact__subtitle">Gestiona las transmisiones entrantes de los visitantes</p>
        </div>
        <div className="admin-contact__filters">
          <button
            className={`admin-contact__filter-btn ${filter === 'all' ? 'admin-contact__filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({messages.length})
          </button>
          <button
            className={`admin-contact__filter-btn ${filter === 'unread' ? 'admin-contact__filter-btn--active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídos ({messages.filter((m) => !m.is_read).length})
          </button>
          <button
            className={`admin-contact__filter-btn ${filter === 'read' ? 'admin-contact__filter-btn--active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídos ({messages.filter((m) => m.is_read).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-contact__error font-mono">
          <span>[ERROR DE RED] {error}</span>
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={<Icon name="mail-open" />}
          title="Buzón vacío"
          description={
            filter === 'unread'
              ? 'No tienes transmisiones sin leer.'
              : filter === 'read'
              ? 'No hay transmisiones marcadas como leídas.'
              : 'Nadie ha intentado comunicarse aún.'
          }
        />
      ) : (
        <div className="admin-contact__workspace">
          {/* List panel */}
          <div className="admin-contact__list">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`admin-contact__item ${!msg.is_read ? 'admin-contact__item--unread' : ''} ${
                  selectedMessage?.id === msg.id ? 'admin-contact__item--selected' : ''
                }`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="admin-contact__item-header">
                  <span className="admin-contact__item-author">{msg.name || 'Anónimo'}</span>
                  <span className="admin-contact__item-time font-mono">
                    {formatDate(msg.created_at, { relative: true })}
                  </span>
                </div>
                <div className="admin-contact__item-subject">{msg.subject}</div>
                <div className="admin-contact__item-excerpt">{msg.message}</div>
              </div>
            ))}
          </div>

          {/* Details panel */}
          <div className="admin-contact__details">
            {selectedMessage ? (
              <div className="admin-contact__details-inner">
                <div className="admin-contact__details-header">
                  <div>
                    <h2 className="admin-contact__details-subject">{selectedMessage.subject}</h2>
                    <div className="admin-contact__details-meta">
                      <span>De: <strong>{selectedMessage.name || 'Anónimo'}</strong></span>
                      <span className="admin-contact__details-email font-mono">&lt;{selectedMessage.email}&gt;</span>
                      <span className="admin-contact__details-date">
                        {formatDate(selectedMessage.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-contact__details-actions">
                    <button
                      className="admin-contact__action-btn"
                      onClick={() => handleToggleRead(selectedMessage)}
                      title={selectedMessage.is_read ? 'Marcar como no leído' : 'Marcar como leído'}
                    >
                      {selectedMessage.is_read ? <Icon name="eye" /> : <Icon name="eye" />}
                    </button>
                    <button
                      className="admin-contact__action-btn admin-contact__action-btn--danger"
                      onClick={() => handleDelete(selectedMessage.id)}
                      title="Eliminar permanentemente"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
                <div className="admin-contact__details-body">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
            ) : (
              <div className="admin-contact__details-empty font-mono">
                <span>[SELECCIONA UNA TRANSMISIÓN EN EL PANEL IZQUIERDO PARA LEERLA]</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
