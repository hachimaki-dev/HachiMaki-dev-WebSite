/**
 * AdminStreamChatModal.jsx — Modal to view and manage room chat history
 */

import { useEffect } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { PageLoader } from '../../../components/ui/PageLoader'
import { useChatAdmin } from '../../../features/streaming/hooks/useChatAdmin'
import './AdminStreamChatModal.css'

export function AdminStreamChatModal({ isOpen, onClose, room }) {
  const { messages, loading, error, loadChatHistory, deleteMessage, clearChatHistory } = useChatAdmin()

  useEffect(() => {
    if (isOpen && room?.id) {
      loadChatHistory(room.id)
    }
  }, [isOpen, room, loadChatHistory])

  if (!room) return null

  const handleClear = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar TODO el historial de chat de esta sala? Esta acción no se puede deshacer.')) {
      await clearChatHistory(room.id)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="admin-chat-modal">
        <div className="admin-chat-modal__header">
          <h2 className="admin-chat-modal__title">💬 Historial: {room.title}</h2>
          <button 
            className="admin-chat-modal__clear-btn" 
            onClick={handleClear}
            disabled={messages.length === 0 || loading}
          >
            Vaciar Chat
          </button>
        </div>

        <div className="admin-chat-modal__content">
          {error && <div className="admin-chat-modal__error">{error}</div>}
          
          {loading ? (
            <PageLoader />
          ) : (
            <div className="admin-chat-modal__list">
              {messages.length === 0 ? (
                <div className="admin-chat-modal__empty">No hay mensajes en esta sala.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="admin-chat-modal__msg">
                    <div className="admin-chat-modal__msg-content">
                      <div className="admin-chat-modal__msg-meta">
                        <span className="admin-chat-modal__msg-author">{msg.display_name}</span>
                        <span className="admin-chat-modal__msg-time">
                          {new Date(msg.created_at).toLocaleString('es')}
                        </span>
                      </div>
                      <span className="admin-chat-modal__msg-text">{msg.message}</span>
                    </div>
                    <button 
                      className="admin-chat-modal__del-btn"
                      onClick={() => deleteMessage(msg.id)}
                      title="Eliminar mensaje"
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
