import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { ROUTES } from '../../lib/constants'
import './AdminLayout.css'
import Icon from '../ui/Icon'

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.HOME)
  }

  const sidebarLinks = [
    { to: ROUTES.ADMIN, label: 'Dashboard', icon: '◉', end: true },
    { to: ROUTES.ADMIN_BLOG, label: 'Blog', icon: <Icon name="magic-edit" />, end: false },
    { to: ROUTES.ADMIN_COURSES, label: 'Cursos', icon: <Icon name="book" />, end: false },
    { to: ROUTES.ADMIN_PORTFOLIO, label: 'Portfolio', icon: '◧', end: false },
    { to: ROUTES.ADMIN_STREAMS, label: 'Streams', icon: <Icon name="radio" />, end: false },
    { to: ROUTES.ADMIN_PHOTOS, label: 'Photos', icon: <Icon name="camera" />, end: false },
    { to: ROUTES.ADMIN_CONTACT, label: 'Mensajes', icon: <Icon name="mail" />, end: false },
    { to: ROUTES.ADMIN_SUBSCRIPTIONS, label: 'Suscriptores', icon: <Icon name="users" />, end: false },
    { to: ROUTES.ADMIN_FRIEND_LINKS, label: 'Linkeame', icon: <Icon name="link" />, end: false },
    { to: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: <Icon name="settings-2" />, end: false },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <a href="/" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-bracket">{`{`}</span>
            <span className="admin-sidebar__logo-text">hm</span>
            <span className="admin-sidebar__logo-bracket">{`}`}</span>
          </a>
          <span className="admin-sidebar__label">Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {sidebarLinks.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <span className="admin-sidebar__link-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" className="admin-sidebar__link" target="_blank" rel="noopener noreferrer">
            <span className="admin-sidebar__link-icon">↗</span>
            <span>Ver sitio</span>
          </a>
          <button className="admin-sidebar__link admin-sidebar__link--danger" onClick={handleSignOut}>
            <span className="admin-sidebar__link-icon"><Icon name="power" /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
