import { useState, useEffect } from 'react'

/**
 * Muestra el tiempo restante antes de que se borre un recurso
 * @param {{ createdAt: string, maxDays: number, onExpire?: () => void }} props
 */
export function Countdown({ createdAt, maxDays = 7, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const expiresAt = new Date(createdAt)
    expiresAt.setDate(expiresAt.getDate() + maxDays)

    const updateTimer = () => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expirado')
        if (onExpire) onExpire()
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / 1000 / 60) % 60)

      setTimeLeft(`${d}d ${h}h ${m}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [createdAt, maxDays, onExpire])

  return (
    <span className={`countdown ${timeLeft === 'Expirado' ? 'countdown--expired' : ''}`}>
      ⏱ {timeLeft}
    </span>
  )
}
