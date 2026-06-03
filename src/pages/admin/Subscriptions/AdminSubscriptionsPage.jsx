import { useState } from 'react'
import { useSubscriptionsAdmin } from '../../../features/subscriptions/useSubscriptionsAdmin'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useToast } from '../../../components/ui/Toast'
import { formatDate } from '../../../utils/formatDate'
import './AdminSubscriptionsPage.css'

export function AdminSubscriptionsPage() {
  const { subscribers, loading, error, updatePreferences, remove } = useSubscriptionsAdmin()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'streams', 'newsletter'

  if (loading) return <PageLoader />

  const handleTogglePreference = async (sub, field) => {
    const updatedValue = !sub[field]
    try {
      await updatePreferences(sub.id, { [field]: updatedValue })
      toast({
        type: 'success',
        message: 'Preferencias de suscripción actualizadas.',
      })
    } catch (err) {
      toast({ type: 'error', message: `Error: ${err.message}` })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres dar de baja y eliminar a este suscriptor permanentemente?')) {
      return
    }

    try {
      await remove(id)
      toast({ type: 'success', message: 'Suscriptor eliminado.' })
    } catch (err) {
      toast({ type: 'error', message: `Error: ${err.message}` })
    }
  }

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (filterType === 'streams') return sub.subscribe_streams
    if (filterType === 'newsletter') return sub.subscribe_newsletter
    return true
  })

  return (
    <div className="admin-subs page-enter">
      <div className="admin-subs__header">
        <div>
          <h1 className="admin-subs__title">Suscriptores del Boletín</h1>
          <p className="admin-subs__subtitle">Administra la lista de correo infiltrada y preferencias de transmisiones</p>
        </div>
      </div>

      <div className="admin-subs__controls">
        <div className="admin-subs__search-wrap">
          <input
            type="text"
            placeholder="Buscar por correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-subs__search-input"
          />
        </div>
        <div className="admin-subs__filters">
          <button
            className={`admin-subs__filter-btn ${filterType === 'all' ? 'admin-subs__filter-btn--active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos ({subscribers.length})
          </button>
          <button
            className={`admin-subs__filter-btn ${filterType === 'streams' ? 'admin-subs__filter-btn--active' : ''}`}
            onClick={() => setFilterType('streams')}
          >
            Notif. Streams ({subscribers.filter((s) => s.subscribe_streams).length})
          </button>
          <button
            className={`admin-subs__filter-btn ${filterType === 'newsletter' ? 'admin-subs__filter-btn--active' : ''}`}
            onClick={() => setFilterType('newsletter')}
          >
            Boletín Crítico ({subscribers.filter((s) => s.subscribe_newsletter).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-subs__error font-mono">
          <span>[ERROR DE BASE DE DATOS] {error}</span>
        </div>
      )}

      {filteredSubscribers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No hay suscriptores"
          description={
            searchTerm
              ? 'Ningún suscriptor coincide con tu búsqueda.'
              : filterType !== 'all'
              ? 'No hay suscriptores bajo este filtro.'
              : 'Nadie se ha suscrito todavía.'
          }
        />
      ) : (
        <div className="admin-subs__table-container">
          <table className="admin-subs__table">
            <thead>
              <tr>
                <th>Correo Electrónico</th>
                <th className="text-center">Notif. Streams (📡)</th>
                <th className="text-center">Boletín Crítico (📝)</th>
                <th>Fecha de Registro</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id}>
                  <td className="admin-subs__email font-mono">{sub.email}</td>
                  <td className="text-center">
                    <label className="admin-subs__checkbox-container">
                      <input
                        type="checkbox"
                        checked={sub.subscribe_streams}
                        onChange={() => handleTogglePreference(sub, 'subscribe_streams')}
                        className="admin-subs__checkbox"
                      />
                      <span className="admin-subs__checkbox-custom"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="admin-subs__checkbox-container">
                      <input
                        type="checkbox"
                        checked={sub.subscribe_newsletter}
                        onChange={() => handleTogglePreference(sub, 'subscribe_newsletter')}
                        className="admin-subs__checkbox"
                      />
                      <span className="admin-subs__checkbox-custom"></span>
                    </label>
                  </td>
                  <td className="admin-subs__date">
                    {formatDate(sub.created_at)}
                  </td>
                  <td className="text-right">
                    <button
                      className="admin-subs__delete-btn"
                      onClick={() => handleDelete(sub.id)}
                      title="Eliminar suscriptor"
                    >
                      🗑️ Dar de Baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
