import { Link } from 'react-router-dom'
import { SITE, ROUTES } from '../../lib/constants'
import './Footer.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          {/* Brand */}
          <div className="footer__brand">
            <span className="footer__logo">
              <span className="footer__logo-bracket">{`{`}</span>
              <span className="footer__logo-text">La Nave</span>
              <span className="footer__logo-bracket">{`}`}</span>
            </span>
            <p className="footer__disclaimer">
              Aviso Parroquial: Este sitio representa una faceta puramente personal, nacida del sano (y a veces obstinado) entusiasmo de querer crear, compartir y experimentar con mi propio trozo de internet. No pretende satisfacer las expectativas de nadie más que las mías. Navega bajo tu propio riesgo, pero con buena onda.
            </p>
          </div>

          {/* Links */}
          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__col-title">Sitio</h4>
              <Link to={ROUTES.HOME} className="footer__link">Inicio</Link>
              <Link to={ROUTES.BLOG} className="footer__link">Blog</Link>
              <Link to={ROUTES.PORTFOLIO} className="footer__link">Portfolio</Link>
              <Link to={ROUTES.PHOTOS} className="footer__link">Fotos</Link>
              <Link to={ROUTES.VISITORS} className="footer__link">Visitantes</Link>
              <Link to={ROUTES.CONTACT} className="footer__link">Contacto</Link>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Social</h4>
              <a
                href="https://github.com/hachimaki-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} {SITE.NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

