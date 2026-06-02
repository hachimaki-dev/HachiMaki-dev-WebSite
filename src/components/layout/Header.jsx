import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ROUTES } from '../../lib/constants'
import './Header.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: ROUTES.HOME, label: 'HOME' },
    { to: ROUTES.BLOG, label: 'BLOG' },
    { to: ROUTES.PORTFOLIO, label: 'PORTFOLIO' },
  ]

  /* VHS clock */
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timestamp = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo — tape marker */}
        <Link to={ROUTES.HOME} className="header__logo" aria-label="Ir al inicio">
          <span className="header__logo-mark">///</span>
        </Link>

        {/* Desktop nav */}
        <nav className="header__nav" aria-label="Navegación principal">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `header__link ${isActive ? 'header__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* REC + timestamp */}
        <div className="header__vhs">
          <span className="header__rec">
            <span className="header__rec-dot animate-rec"></span>
          </span>
          <span className="header__time">{timestamp}</span>
        </div>

        {/* Mobile menu button */}
        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div className="header__mobile-nav animate-fade-in">
          <nav aria-label="Navegación móvil">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
