import { useState } from 'react'
import { useSubscriptions } from '../../features/subscriptions/useSubscriptions'
import { useToast } from './Toast'
import './NewsletterInvite.css'
import Icon from './Icon'

export function NewsletterInvite() {
  const { subscribe, loading } = useSubscriptions()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [subscribeStreams, setSubscribeStreams] = useState(true)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast({ type: 'warning', message: 'Por favor, ingresa tu correo electrónico.' })
      return
    }

    if (!subscribeStreams && !subscribeNewsletter) {
      toast({ type: 'warning', message: 'Selecciona al menos un canal de suscripción.' })
      return
    }

    const res = await subscribe({
      email,
      subscribeStreams,
      subscribeNewsletter,
    })

    if (res.success) {
      toast({ type: 'success', message: '¡Suscripción registrada con éxito en el canal crítico!' })
      setEmail('')
    } else {
      toast({ type: 'error', message: `Error al suscribirse: ${res.error}` })
    }
  }

  return (
    <div className="vhs-card">


      <div className="newsletter-invite__content">
        <h3 className="newsletter-invite__title">
          <span className="newsletter-invite__title-bracket">//</span>
          Súbete a la nave
        </h3>

        <form onSubmit={handleSubmit} className="newsletter-invite__form">
          <div className="newsletter-invite__options">
            <label className="newsletter-invite__checkbox-label">
              <input
                type="checkbox"
                checked={subscribeStreams}
                onChange={(e) => setSubscribeStreams(e.target.checked)}
                className="newsletter-invite__checkbox"
              />
              <span className="newsletter-invite__checkbox-custom"></span>

              <span className="newsletter-invite__option-text">
              </span>
              <Icon name="radio" /> Notificarme de transmiciones en vivo

            </label>

            <label className="newsletter-invite__checkbox-label">
              <input
                type="checkbox"
                checked={subscribeNewsletter}
                onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                className="newsletter-invite__checkbox"
              />
              <span className="newsletter-invite__checkbox-custom"></span>
              <Icon name="notes" /> Nuevas publicaciones
              <span className="newsletter-invite__option-text">
              </span>
            </label>
          </div>

          <div className="newsletter-invite__input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@hackealotodo.yes"
              autoComplete="email"
              required
              className="newsletter-invite__input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="newsletter-invite__submit-btn"
            >
              {loading ? 'CONECTANDO...' : 'SUSCRIBIR'}
            </button>
          </div>
        </form>
      </div >
    </div >
  )
}
