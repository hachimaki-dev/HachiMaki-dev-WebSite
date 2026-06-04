/**
 * FriendShowcase.jsx — Showcase of friendly website banners (Linkeame / Webring)
 *
 * Renders a row/grid of animated 88x31 banners below the footer.
 * Includes a "Tu Web Aquí" invite button and a copy-paste link code section.
 */

import { useState } from 'react'
import { useFriendLinks } from '../../features/friends/useFriendLinks'
import { SITE, ROUTES } from '../../lib/constants'
import './FriendShowcase.css'

export function FriendShowcase() {
  const { links, loading, error } = useFriendLinks()
  const [showCode, setShowCode] = useState(false)

  if (loading) return null // Hide while loading to prevent footer layout shifts
  if (error) return null   // Fail silently on footer widgets

  const bannerCode = `<a href="${SITE.URL}" target="_blank" title="${SITE.NAME}">\n  <img src="${SITE.URL}/minibannerlanave.jpg" alt="${SITE.NAME}" width="88" height="31" border="0" />\n</a>`

  return (
    <div className="friend-showcase">
      <div className="friend-showcase__divider"></div>

      <div className="friend-showcase__header">
        <h3 className="friend-showcase__title">
          <span className="friend-showcase__icon">🌐</span> Webs Amigas &amp; Linkeame
        </h3>
        <button
          className="friend-showcase__code-toggle"
          onClick={() => setShowCode((prev) => !prev)}
        >
          {showCode ? '✕ Cerrar' : '🔗 Intercambio'}
        </button>
      </div>

      {showCode && (
        <div className="friend-showcase__code-box page-enter">
          <div className="friend-showcase__code-header">
            <div className="friend-showcase__own-preview">
              <span className="friend-showcase__own-preview-label font-mono">Nuestro Banner:</span>
              <div className="friend-showcase__own-banner">
                <img src="./minibannerlanave.jpg" alt={SITE.NAME} className="friend-showcase__img" />
              </div>
            </div>
            <p className="friend-showcase__code-desc">
              Copia este código HTML en tu web para enlazarnos (Banner de 88x31 px):
            </p>
          </div>
          <div className="friend-showcase__code-wrapper">
            <textarea
              readOnly
              className="friend-showcase__textarea font-mono"
              value={bannerCode}
              onClick={(e) => e.target.select()}
            />
            <button
              className="friend-showcase__copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(bannerCode)
                alert('¡Código copiado al portapapeles!')
              }}
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      <div className="friend-showcase__grid">
        {/* Our Own Site Banner */}
        <a
          href={SITE.URL}
          target="_blank"
          rel="noopener noreferrer"
          className="friend-showcase__banner friend-showcase__banner--own"
          title={SITE.NAME}
        >
          <div className="friend-showcase__own-banner">
            <img src="./minibannerlanave.jpg" alt={SITE.NAME} className="friend-showcase__img" /></div>
        </a>

        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`friend-showcase__banner friend-showcase__banner--${link.animation_type}`}
            title={link.name}
          >
            <img
              src={link.image_url}
              alt={link.name}
              className="friend-showcase__img"
              loading="lazy"
            />
          </a>
        ))}

        {/* Retro "Tu Web Aquí" button linking to Contact Page */}
        <a
          href={`${ROUTES.CONTACT}?subject=Intercambio%20de%20Banners`}
          className="friend-showcase__banner friend-showcase__banner--placeholder"
          title="¿Intercambio? Clic aquí"
        >
          <div className="friend-showcase__placeholder-inner">
            <span className="friend-showcase__placeholder-plus">+</span>
            <span className="friend-showcase__placeholder-text">Tu Web Aquí</span>
          </div>
        </a>
      </div>
    </div>
  )
}
