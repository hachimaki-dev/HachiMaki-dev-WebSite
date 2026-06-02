/**
 * StreamRoomPage.jsx — Room lobby / entry point
 *
 * Shows room info and status, directs users to either
 * the CasterPage (if admin) or ViewerPage (if viewer).
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../features/auth/useAuth'
import { useRooms } from '../../../features/streaming/hooks/useRooms'
import { usePresence } from '../../../features/streaming/hooks/usePresence'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import './StreamRoomPage.css'

export function StreamRoomPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getRoomBySlug } = useRooms()
  const { viewerCount } = usePresence(room?.id, 'viewer')

  useEffect(() => {
    async function loadRoom() {
      const r = await getRoomBySlug(slug)
      setRoom(r)
      setLoading(false)
    }
    if (slug) loadRoom()
  }, [slug, getRoomBySlug])

  if (loading) return <PageLoader />

  if (!room) {
    return (
      <div className="stream-room">
        <EmptyState
          title="Sala no encontrada"
          description="La sala de streaming que buscas no existe o fue eliminada."
        />
      </div>
    )
  }

  const isCaster = user?.id === room.caster_id
  const isLive = room.status === 'live'
  const isEnded = room.status === 'ended'

  const statusLabel = isLive ? 'EN VIVO' : isEnded ? 'FINALIZADO' : 'OFFLINE'
  const statusClass = isLive ? '--live' : isEnded ? '--ended' : '--offline'

  return (
    <div className="stream-room">
      <div className="stream-room__card">
        <span className={`stream-room__status-badge stream-room__status-badge${statusClass}`}>
          {isLive && '🔴 '}
          {statusLabel}
        </span>

        <h1 className="stream-room__title">{room.title}</h1>

        <p className="stream-room__meta">
          /{room.slug}
        </p>

        {isLive && (
          <div className="stream-room__viewers">
            👁 {viewerCount} espectador{viewerCount !== 1 ? 'es' : ''} conectados
          </div>
        )}

        <div className="stream-room__actions">
          {/* Watch button — always visible when live */}
          {isLive && (
            <button
              className="stream-room__btn stream-room__btn--watch"
              onClick={() => navigate(`/stream/${slug}/watch`)}
            >
              ▶ Ver Stream
            </button>
          )}

          {/* Cast button — only for the admin/caster */}
          {isCaster && !isLive && (
            <button
              className="stream-room__btn stream-room__btn--cast"
              onClick={() => navigate(`/stream/${slug}/cast`)}
            >
              🔴 Iniciar Transmisión
            </button>
          )}

          {isCaster && isLive && (
            <button
              className="stream-room__btn stream-room__btn--secondary"
              onClick={() => navigate(`/stream/${slug}/cast`)}
            >
              🎛 Panel del Emisor
            </button>
          )}

          {/* Offline message for non-casters */}
          {!isCaster && !isLive && (
            <p className="stream-room__meta">
              El emisor no está transmitiendo en este momento. Vuelve más tarde.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
