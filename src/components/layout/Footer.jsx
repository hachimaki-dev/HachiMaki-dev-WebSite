import { SITE } from '../../lib/constants'
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
              <span className="footer__logo-text">hm</span>
              <span className="footer__logo-bracket">{`}`}</span>
            </span>
            <p className="footer__tagline">Building things for the web.</p>
          </div>

          {/* Links */}
          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__col-title">Sitio</h4>
              <a href="/" className="footer__link">Inicio</a>
              <a href="/blog" className="footer__link">Blog</a>
              <a href="/portfolio" className="footer__link">Portfolio</a>
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
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                Twitter / X
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
