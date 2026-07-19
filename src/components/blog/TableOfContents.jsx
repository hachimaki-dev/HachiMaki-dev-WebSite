import { useState, useEffect, useRef, useCallback } from 'react'
import './TableOfContents.css'

/**
 * TableOfContents — Sticky sidebar nav generated from markdown headings
 * @param {{ content: string, format?: 'markdown'|'html', layout?: 'sidebar'|'grid', isCollapsed?: boolean, onToggleCollapse?: () => void }} props
 */
export function TableOfContents({ 
  content, 
  format = 'markdown', 
  layout = 'sidebar',
  isCollapsed = false,
  onToggleCollapse
}) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef(null)

  // Parse headings from content
  useEffect(() => {
    if (!content) return

    let parsed = []

    // Helper to strip emojis and clean up leading symbols to make it look like clean system text
    const cleanHeadingText = (text) => {
      // Strips standard Unicode emojis
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]/gu
      let clean = text.replace(emojiRegex, '').trim()
      // Strip any leading punctuation or arrows (e.g. 🎯, 🧠, →, 💡, etc. which might be left or plain text)
      clean = clean.replace(/^[→⇒•·\-\s\d\.]+/g, '').trim()
      return clean
    }

    if (format === 'markdown') {
      // Parse markdown headings (## and ###)
      const lines = content.split('\n')
      for (const line of lines) {
        const match = line.match(/^(#{2,3})\s+(.+)$/)
        if (match) {
          const level = match[1].length
          const rawText = match[2].replace(/[*_`~]/g, '').trim()
          const text = cleanHeadingText(rawText)
          const id = rawText
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
          parsed.push({ id, text, level })
        }
      }
    } else {
      // Parse HTML headings
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      doc.querySelectorAll('h2, h3').forEach((el) => {
        const level = parseInt(el.tagName[1], 10)
        const rawText = el.textContent.trim()
        const text = cleanHeadingText(rawText)
        const id = el.id || rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        parsed.push({ id, text, level })
      })
    }

    setHeadings(parsed)
  }, [content, format])

  // IntersectionObserver to track active heading
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    // Observe all heading elements in the DOM
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings])

  useEffect(() => {
    // Delay to let the markdown render first
    const timer = setTimeout(setupObserver, 300)
    return () => {
      clearTimeout(timer)
      observerRef.current?.disconnect()
    }
  }, [setupObserver])

  if (headings.length < 2) return null

  return (
    <nav 
      className={`toc ${layout === 'grid' ? 'toc--grid' : ''} ${isCollapsed ? 'toc--collapsed' : ''}`} 
      aria-label="Tabla de contenidos"
    >
      <div className="toc__header">
        <div className="toc__title">
          {layout === 'grid' ? 'SECCIONES DE LA LECCIÓN' : 'SECCIONES.SYS'}
        </div>
        {layout === 'sidebar' && onToggleCollapse && (
          <button 
            type="button"
            className="toc__collapse-btn" 
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expandir índice" : "Minimizar índice"}
          >
            {isCollapsed ? '[ + ]' : '[ - ]'}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <ul className={`toc__list ${layout === 'grid' ? 'toc__list--grid' : ''}`}>
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id
            return (
              <li
                key={id}
                className={`toc__item ${level === 3 ? 'toc__item--nested' : ''} ${isActive ? 'toc__item--active' : ''}`}
              >
                <a href={`#${id}`} className="toc__link">
                  {layout === 'sidebar' && level === 3 && (
                    <span className="toc__branch">├─ </span>
                  )}
                  {layout === 'sidebar' && level === 2 && isActive && (
                    <span className="toc__prompt">&gt; </span>
                  )}
                  {text}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}
