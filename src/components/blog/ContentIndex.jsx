import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContentIndex } from '../../features/blog/useContentIndex'
import Icon from '../ui/Icon'

export function ContentIndex() {
  const { items, loading, error } = useContentIndex()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCourses, setExpandedCourses] = useState({})

  const toggleCourse = (courseId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

  if (loading) {
    return (
      <div className="content-index content-index--loading">
        <div className="outsider__feed-loading-bar"></div>
        <span>ACCEDIENDO AL INDICE...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-index content-index--error">
        <Icon name="alert" size={16} />
        <span>ERROR AL CARGAR INDICE</span>
      </div>
    )
  }

  // Filter items based on search query
  const query = searchQuery.trim().toLowerCase()
  const filteredItems = items.map(item => {
    if (!query) return item

    if (item.type === 'blog') {
      const matches = item.title.toLowerCase().includes(query)
      return matches ? item : null
    }

    // Course: check if course title matches OR any lesson matches
    const courseTitleMatches = item.title.toLowerCase().includes(query)
    const matchingLessons = (item.lessons || []).filter(lesson =>
      lesson.title.toLowerCase().includes(query)
    )

    const isVisible = courseTitleMatches || matchingLessons.length > 0

    if (!isVisible) return null

    return {
      ...item,
      // If the course title matched but lessons didn't, show all lessons.
      // If lessons matched, show only matching lessons.
      lessons: matchingLessons.length > 0 ? matchingLessons : item.lessons,
      autoExpand: matchingLessons.length > 0
    }
  }).filter(Boolean)

  return (
    <div className="content-index">
      <div className="content-index__title-row">
        <span className="content-index__title">INDICE_SISTEMA.BAT</span>
        <span className="content-index__count">[{filteredItems.length}]</span>
      </div>

      {/* Retro search input */}
      <div className="content-index__search-wrap">
        <span className="content-index__search-prompt">&gt;</span>
        <input
          type="text"
          placeholder="BUSCAR REGISTRO..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="content-index__search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="content-index__search-clear"
            title="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      <div className="content-index__scroll-area">
        {filteredItems.length === 0 ? (
          <div className="content-index__empty">
            <span>NO SE ENCONTRARON SEÑALES</span>
          </div>
        ) : (
          <ul className="content-index__list">
            {filteredItems.map(item => {
              const isCourse = item.type === 'course'
              // Expand course if either manually expanded OR matches search query lessons (autoExpand)
              const isExpanded = expandedCourses[item.id] || (query !== '' && item.autoExpand)

              if (isCourse) {
                return (
                  <li key={item.id} className="content-index__item content-index__item--course">
                    <div
                      className={`content-index__course-header ${isExpanded ? 'content-index__course-header--expanded' : ''}`}
                      onClick={(e) => toggleCourse(item.id, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleCourse(item.id, e)
                        }
                      }}
                    >
                      <div className="content-index__course-title-wrap">
                        <Icon
                          name={isExpanded ? 'folder-open' : 'folder'}
                          size={14}
                          className="content-index__icon"
                        />
                        <span className="content-index__item-title" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                      <div className="content-index__course-meta">
                        <span className="content-index__lesson-badge">
                          [{item.lessons?.length || 0}]
                        </span>
                        <Icon
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          className="content-index__toggle-arrow"
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <ul className="content-index__lessons-list">
                        {/* Course intro / general info link */}
                        <li className="content-index__lesson-item">
                          <span className="content-index__tree-branch">├─</span>
                          <Link
                            to={item.link}
                            className="content-index__lesson-link content-index__lesson-link--info"
                          >
                            <Icon name="info" size={12} className="content-index__lesson-icon" />
                            <span>PORTADA DEL CURSO</span>
                          </Link>
                        </li>

                        {/* Course lessons list */}
                        {item.lessons && item.lessons.length > 0 ? (
                          item.lessons.map((lesson, idx) => {
                            const isLast = idx === item.lessons.length - 1
                            return (
                              <li key={lesson.id} className="content-index__lesson-item">
                                <span className="content-index__tree-branch">
                                  {isLast ? '└─' : '├─'}
                                </span>
                                <Link
                                  to={lesson.link}
                                  className="content-index__lesson-link"
                                >
                                  <Icon name="notes" size={12} className="content-index__lesson-icon" />
                                  <span className="content-index__lesson-title-text" title={lesson.title}>
                                    {lesson.title}
                                  </span>
                                </Link>
                              </li>
                            )
                          })
                        ) : (
                          <li className="content-index__lesson-item content-index__lesson-item--empty">
                            <span className="content-index__tree-branch">└─</span>
                            <span className="content-index__no-lessons">Próximamente...</span>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )
              }

              // Otherwise, it's a standard blog post
              return (
                <li key={item.id} className="content-index__item content-index__item--blog">
                  <Link to={item.link} className="content-index__blog-link">
                    <Icon name="notes" size={14} className="content-index__icon" />
                    <span className="content-index__item-title" title={item.title}>
                      {item.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
