import { useState } from 'react'
import Icon from '../ui/Icon'
import './BlogShare.css'

export function BlogShare() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="blog-share">
      <button 
        className={`blog-share__btn ${copied ? 'blog-share__btn--copied' : ''}`}
        onClick={handleShare}
        type="button"
        aria-label="Compartir transmisión"
      >
        <span className="blog-share__icon">
          <Icon name={copied ? 'lock' : 'link'} />
        </span>
        <span className="blog-share__text">
          {copied ? 'ENLACE ENCRIPTADO EN PORTAPAPELES' : 'INTERCEPTAR Y COMPARTIR SEÑAL'}
        </span>
      </button>
    </div>
  )
}
