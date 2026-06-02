/**
 * AdminStreamsPage.jsx — Admin panel for managing streaming rooms
 *
 * Lists rooms, allows creation/deletion, shows recordings
 * with download links.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { useRooms } from '../../../features/streaming/hooks/useRooms'
import { createStreamLogger } from '../../../features/streaming/lib/streamLogger'
import './AdminStreamsPage.css'

const log = createStreamLogger('AdminStreams')

/** Format bytes to human-readable */
function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Format duration ms to mm:ss */
function formatDuration(ms) {
  if (!ms) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Format ISO date */
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminStreamsPage() {
  const navigate = useNavigate()
  const { rooms, loading, error, listRooms, createRoom, deleteRoom } = useRooms()
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [recordings, setRecordings] = useState([])

  /* Load rooms and recordings */
  useEffect(() => {
    listRooms()
    loadRecordings()
  }, [listRooms])

  const loadRecordings = useCallback(async () => {
    const { data, error: fetchErr } = await supabase
      .from(TABLES.RECORDINGS)
      .select('*, rooms(title, slug)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchErr) {
      log.error('Failed to load recordings:', fetchErr.message)
    } else {
      setRecordings(data || [])
    }
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setCreating(true)
    const room = await createRoom(newTitle.trim())
    if (room) {
      setNewTitle('')
      await listRooms()
    }
    setCreating(false)
  }

  const handleDelete = async (roomId) => {
    const ok = window.confirm('¿Eliminar esta sala y todas sus grabaciones?')
    if (!ok) return

    await deleteRoom(roomId)
    await loadRecordings()
  }

  const getRecordingUrl = (filePath) => {
    const { data } = supabase.storage.from('recordings').getPublicUrl(filePath)
    return data?.publicUrl || '#'
  }

  return (
    <div className="admin-streams">
      <div className="admin-streams__header">
        <h1 className="admin-streams__title">📡 Streaming</h1>
      </div>

      {/* Create room form */}
      <form className="admin-streams__create" onSubmit={handleCreate}>
        <input
          className="admin-streams__create-input"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nombre de la nueva sala…"
          maxLength={100}
        />
        <button
          type="submit"
          className="admin-streams__create-btn"
          disabled={!newTitle.trim() || creating}
        >
          {creating ? 'Creando…' : '+ Crear Sala'}
        </button>
      </form>

      {error && <div className="caster-page__error">{error}</div>}

      {/* Rooms table */}
      {rooms.length > 0 ? (
        <table className="admin-streams__table">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Slug</th>
              <th>Estado</th>
              <th>Creada</th>
              <th>Grabaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.title}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                  /{room.slug}
                </td>
                <td>
                  <span className={`admin-streams__status admin-streams__status--${room.status}`}>
                    {room.status === 'live' && '🔴 '}
                    {room.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-size-xs)' }}>
                  {formatDate(room.created_at)}
                </td>
                <td>{room.recordings?.length || 0}</td>
                <td>
                  <div className="admin-streams__actions">
                    <button
                      className="admin-streams__action-btn"
                      onClick={() => navigate(`/stream/${room.slug}`)}
                      title="Ver sala"
                    >
                      👁
                    </button>
                    <button
                      className="admin-streams__action-btn"
                      onClick={() => navigate(`/stream/${room.slug}/cast`)}
                      title="Emitir"
                    >
                      🔴
                    </button>
                    <button
                      className="admin-streams__action-btn admin-streams__action-btn--danger"
                      onClick={() => handleDelete(room.id)}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && (
          <div className="admin-streams__empty">
            No hay salas de streaming. Crea una arriba.
          </div>
        )
      )}

      {/* Recordings */}
      {recordings.length > 0 && (
        <>
          <h2 className="admin-streams__recordings-title">🎬 Grabaciones</h2>
          <table className="admin-streams__table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Fecha</th>
                <th>Duración</th>
                <th>Tamaño</th>
                <th>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.rooms?.title || '—'}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>
                    {formatDate(rec.created_at)}
                  </td>
                  <td>{formatDuration(rec.duration_ms)}</td>
                  <td>{formatBytes(rec.file_size)}</td>
                  <td>
                    <a
                      className="admin-streams__recording-link"
                      href={getRecordingUrl(rec.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ⬇ Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
