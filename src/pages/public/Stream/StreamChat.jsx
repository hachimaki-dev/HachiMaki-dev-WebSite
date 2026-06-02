/**
 * StreamChat.jsx — Live chat component for streaming rooms
 *
 * Renders a scrollable message list with auto-scroll,
 * a text input, and optional admin delete controls.
 */

import { useState, useRef, useEffect } from 'react'
import './StreamChat.css'

/**
 * Format a timestamp to HH:MM
 * @param {string} isoString
 * @returns {string}
 */
function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * StreamChat — Live chat panel
 * @param {Object} props
 * @param {Array} props.messages - Chat messages array
 * @param {function} props.onSend - Send message callback
 * @param {function} [props.onDelete] - Delete message callback (admin only)
 * @param {boolean} [props.isAdmin] - Whether the current user is admin
 */
export function StreamChat({ messages, onSend, onDelete, isAdmin = false }) {
  const [text, setText] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    /* Only auto-scroll if user is near the bottom */
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="stream-chat">
      <div className="stream-chat__header">
        <span className="stream-chat__title">💬 Chat en Vivo</span>
        <span className="stream-chat__count">{messages.length}</span>
      </div>

      <div className="stream-chat__messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="stream-chat__empty">Sin mensajes aún…</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="stream-chat__message">
              <div className="stream-chat__message-header">
                <span
                  className={`stream-chat__sender ${
                    msg.display_name === 'Caster' ? 'stream-chat__sender--caster' : ''
                  }`}
                >
                  {msg.display_name}
                </span>
                <span className="stream-chat__time">{formatTime(msg.created_at)}</span>
              </div>
              <span className="stream-chat__text">{msg.message}</span>
              {isAdmin && onDelete && (
                <button
                  className="stream-chat__delete"
                  onClick={() => onDelete(msg.id)}
                  title="Eliminar mensaje"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="stream-chat__input-area" onSubmit={handleSubmit}>
        <input
          className="stream-chat__input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje…"
          maxLength={500}
        />
        <button
          type="submit"
          className="stream-chat__send"
          disabled={!text.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
