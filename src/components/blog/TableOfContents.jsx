import { useState, useEffect, useRef, useCallback } from 'react'
import './TableOfContents.css'

/**
 * TableOfContents — Sticky sidebar nav generated from markdown headings
 * @param {{ content: string, format?: 'markdown'|'html' }} props
 */
export function TableOfContents({ content, format = 'markdown' }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef(null)

  // Parse headings from content
  useEffect(() => {
    if (!content) return

    let parsed = []

    if (format === 'markdown') {
      // Parse markdown headings (## and ###)
      const lines = content.split('\n')
      for (const line of lines) {
        const match = line.match(/^(#{2,3})\s+(.+)$/)
        if (match) {
          const level = match[1].length
          const text = match[2].replace(/[*_`~]/g, '').trim()
          const id = text
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
        const text = el.textContent.trim()
        const id = el.id || text
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
    <nav className="toc" aria-label="Tabla de contenidos">
      <div className="toc__title">CONTENIDO</div>
      <ul className="toc__list">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            className={`toc__item ${level === 3 ? 'toc__item--nested' : ''} ${activeId === id ? 'toc__item--active' : ''}`}
          >
            <a href={`#${id}`} className="toc__link">
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
