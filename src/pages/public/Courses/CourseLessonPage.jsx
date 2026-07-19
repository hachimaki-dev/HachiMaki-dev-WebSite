import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCourses } from '../../../features/courses/useCourses'
import { PageLoader } from '../../../components/ui/PageLoader'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { MarkdownRenderer } from '../../../components/blog/MarkdownRenderer'
import { TableOfContents } from '../../../components/blog/TableOfContents'
import { ROUTES } from '../../../lib/constants'
import { formatDate } from '../../../utils/formatDate'
import Icon from '../../../components/ui/Icon'
import { SEO } from '../../../components/ui/SEO'
import { BlogComments } from '../../../components/blog/BlogComments'
import './CourseLesson.css'

const hasHeadings = (content) => {
  if (!content) return false
  const lines = content.split('\n')
  let count = 0
  for (const line of lines) {
    if (line.match(/^(#{2,3})\s+(.+)$/)) {
      count++
      if (count >= 2) return true
    }
  }
  return false
}

export function CourseLessonPage() {
  const { slug, lessonSlug } = useParams()
  const { getLessonBySlug } = useCourses()
  const navigate = useNavigate()
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [showHud, setShowHud] = useState(false)
  const [progress, setProgress] = useState({})
  const [isSyllabusMobileOpen, setIsSyllabusMobileOpen] = useState(false)
  const [isTocCollapsed, setIsTocCollapsed] = useState(() => {
    return localStorage.getItem('hachimaki_reader_toc_collapsed') === 'true'
  })
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('hachimaki_reader_fontsize') || 'md'
  })
  const [readingTheme, setReadingTheme] = useState(() => {
    return localStorage.getItem('hachimaki_reader_theme') || 'retro-dark'
  })

  useEffect(() => {
    localStorage.setItem('hachimaki_reader_toc_collapsed', isTocCollapsed)
  }, [isTocCollapsed])

  useEffect(() => {
    localStorage.setItem('hachimaki_reader_fontsize', fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('hachimaki_reader_theme', readingTheme)
  }, [readingTheme])

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true)
      try {
        const result = await getLessonBySlug(slug, lessonSlug)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [slug, lessonSlug, getLessonBySlug])

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (height > 0) {
        setScrollPercent((winScroll / height) * 100)
      } else {
        setScrollPercent(0)
      }

      // Show HUD if scrolled past 300px
      if (winScroll > 300) {
        setShowHud(true)
      } else {
        setShowHud(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lessonSlug])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hachimaki_course_progress')
      if (saved) {
        setProgress(JSON.parse(saved))
      }
    } catch (e) {
      // Ignore
    }
  }, [lessonSlug])

  // Keyboard navigation
  useEffect(() => {
    if (!data) return

    const handleKeyDown = (e) => {
      // Don't trigger navigation if the user is typing in an input, textarea or editable block
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
      ) {
        return
      }

      const { course, prevLesson, nextLesson } = data

      if (e.key === 'ArrowRight' && nextLesson) {
        navigate(
          ROUTES.COURSE_LESSON
            .replace(':slug', course.slug)
            .replace(':lessonSlug', nextLesson.slug)
        )
      } else if (e.key === 'ArrowLeft' && prevLesson) {
        navigate(
          ROUTES.COURSE_LESSON
            .replace(':slug', course.slug)
            .replace(':lessonSlug', prevLesson.slug)
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [data, navigate])

  if (loading) return <PageLoader />
  
  if (error) {
    return (
      <PageWrapper narrow>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="course-lesson-error">
          <Icon name="warning-diamond" className="course-lesson-error__icon" />
          <span>ERROR DE TRANSMISIÓN</span>
          <span className="course-lesson-error__sub">{error}</span>
          <Link to={ROUTES.COURSES} className="course-lesson-error__btn">
            VOLVER A TUTORIALES
          </Link>
        </div>
      </PageWrapper>
    )
  }

  if (!data || !data.lesson) {
    return (
      <PageWrapper narrow>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="course-lesson-error">
          <Icon name="warning-diamond" className="course-lesson-error__icon" />
          <span>LECCIÓN NO ENCONTRADA</span>
          <Link to={ROUTES.COURSES} className="course-lesson-error__btn">
            VOLVER A TUTORIALES
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const { course, lesson, prevLesson, nextLesson, allLessons = [] } = data
  const isCompleted = !!progress[lesson.id]

  const toggleCompletion = () => {
    const newProgress = { ...progress, [lesson.id]: !progress[lesson.id] }
    setProgress(newProgress)
    try {
      localStorage.setItem('hachimaki_course_progress', JSON.stringify(newProgress))
    } catch (e) {
      // Ignore
    }
  }

  const getEmbedUrl = (url) => {
    if (!url) return null
    // YouTube matcher
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    let match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
    }
    // Vimeo matcher
    regExp = /vimeo\.com\/([0-9]+)/
    match = url.match(regExp)
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`
    }
    return null
  }

  const embedUrl = getEmbedUrl(lesson.video_url)

  return (
    <PageWrapper className={`course-lesson-wrapper theme-${readingTheme}`}>
      <SEO 
        title={`${lesson.title} - ${course.title}`} 
        description={lesson.excerpt || course.description} 
        type="article"
        image={course.cover_url}
        url={window.location.href}
      />
      <div className="vhs-scanlines vhs-noise"></div>
      
      {/* Top Scroll Reading Progress */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }} />
      </div>

      <div className="course-lesson">
        
        {/* Navigation Bar */}
        <div className="course-lesson__top-nav">
          <Link to={ROUTES.COURSE_DETAIL.replace(':slug', course.slug)} className="course-lesson__back-link">
            <Icon name="arrow-left" size={16} /> VOLVER A {course.title.toUpperCase()}
          </Link>
          
          <button 
            className="course-lesson__mobile-menu-btn"
            onClick={() => setIsSyllabusMobileOpen(!isSyllabusMobileOpen)}
            aria-label="Abrir índice del curso"
          >
            <Icon name={isSyllabusMobileOpen ? 'close' : 'menu'} size={18} /> 
            <span>{isSyllabusMobileOpen ? 'CERRAR ÍNDICE' : 'ÍNDICE CURSO'}</span>
          </button>
        </div>

        <div className={`course-lesson__layout ${hasHeadings(lesson.content) ? 'course-lesson__layout--has-toc' : ''} ${isTocCollapsed ? 'course-lesson__layout--toc-collapsed' : ''}`}>
          
          {/* Left Sidebar Table of Contents */}
          {hasHeadings(lesson.content) && (
            <TableOfContents 
              content={lesson.content} 
              layout="sidebar" 
              isCollapsed={isTocCollapsed}
              onToggleCollapse={() => setIsTocCollapsed(!isTocCollapsed)}
            />
          )}

          {/* Main Article Content */}
          <article className="course-lesson__main animate-slide-up">
            
            {/* Reading preferences control panel */}
            <div className="lesson-preferences-bar">
              <div className="pref-group">
                <span className="pref-label">TAMAÑO:</span>
                <button 
                  className={`pref-btn ${fontSize === 'sm' ? 'pref-btn--active' : ''}`}
                  onClick={() => setFontSize('sm')}
                  title="Texto Chico"
                >
                  A-
                </button>
                <button 
                  className={`pref-btn ${fontSize === 'md' ? 'pref-btn--active' : ''}`}
                  onClick={() => setFontSize('md')}
                  title="Texto Normal"
                >
                  A
                </button>
                <button 
                  className={`pref-btn ${fontSize === 'lg' ? 'pref-btn--active' : ''}`}
                  onClick={() => setFontSize('lg')}
                  title="Texto Grande"
                >
                  A+
                </button>
              </div>

              <div className="pref-group">
                <span className="pref-label">TEMA:</span>
                <button 
                  className={`pref-btn pref-btn--theme ${readingTheme === 'retro-dark' ? 'pref-btn--active' : ''}`}
                  onClick={() => setReadingTheme('retro-dark')}
                >
                  RETRO
                </button>
                <button 
                  className={`pref-btn pref-btn--theme ${readingTheme === 'high-contrast' ? 'pref-btn--active' : ''}`}
                  onClick={() => setReadingTheme('high-contrast')}
                >
                  CONTRASTE
                </button>
                <button 
                  className={`pref-btn pref-btn--theme ${readingTheme === 'amber-terminal' ? 'pref-btn--active' : ''}`}
                  onClick={() => setReadingTheme('amber-terminal')}
                >
                  ÁMBAR
                </button>
                <button 
                  className={`pref-btn pref-btn--theme ${readingTheme === 'green-terminal' ? 'pref-btn--active' : ''}`}
                  onClick={() => setReadingTheme('green-terminal')}
                >
                  VERDE
                </button>
              </div>
            </div>

            <header className="course-lesson__header">
              <div className="course-lesson__meta">
                <span className="course-lesson__meta-item">
                  <Icon name="calendar" size={14} /> {formatDate(lesson.published_at || lesson.created_at).toUpperCase()}
                </span>
                <span className="course-lesson__meta-item">
                  <Icon name="clock" size={14} /> {lesson.reading_time_min} MIN LECT.
                </span>
                {isCompleted && (
                  <span className="course-lesson__meta-item course-lesson__meta-item--completed">
                    <Icon name="check" size={14} /> COMPLETADO
                  </span>
                )}
              </div>
              
              <h1 className="course-lesson__title">{lesson.title}</h1>
              
              {/* Retro Video Player */}
              {lesson.video_url && (
                <div className="course-lesson__video">
                  {embedUrl ? (
                    <div className="retro-video-wrapper">
                      <div className="retro-video-screen">
                        <iframe
                          src={embedUrl}
                          title={lesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                        <div className="retro-video-overlay">CRT MONITOR // DECODIFICANDO VIDEO // CH-01</div>
                      </div>
                    </div>
                  ) : (
                    <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="course-lesson__video-link">
                      <Icon name="play" /> INICIAR STREAM DE VIDEO EXTERNO //_
                    </a>
                  )}
                </div>
              )}
            </header>

            {/* Table of Contents in current page - Relocated to top of course content */}
            {hasHeadings(lesson.content) && (
              <TableOfContents content={lesson.content} layout="grid" />
            )}

            <div className={`course-lesson__content course-lesson__content--font-${fontSize}`}>
              <MarkdownRenderer content={lesson.content} format={lesson.content_format || 'markdown'} />
            </div>

            {/* Complete Checkbox & Next buttons */}
            <div className="course-lesson__actions">
              <button 
                onClick={toggleCompletion} 
                className={`course-lesson__complete-btn ${isCompleted ? 'course-lesson__complete-btn--completed' : ''}`}
              >
                <Icon name={isCompleted ? 'check' : 'circle'} size={18} />
                <span>{isCompleted ? 'LECCIÓN COMPLETADA' : 'MARCAR COMO COMPLETADA'}</span>
              </button>
            </div>

            <nav className="course-lesson__bottom-nav">
              {prevLesson ? (
                <Link 
                  to={ROUTES.COURSE_LESSON.replace(':slug', course.slug).replace(':lessonSlug', prevLesson.slug)}
                  className="course-lesson__nav-btn course-lesson__nav-btn--prev"
                >
                  <Icon name="chevron-left" />
                  <div>
                    <span className="course-lesson__nav-label">
                      ANTERIOR <span className="kbd-badge">←</span>
                    </span>
                    <span className="course-lesson__nav-title">{prevLesson.title}</span>
                  </div>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link 
                  to={ROUTES.COURSE_LESSON.replace(':slug', course.slug).replace(':lessonSlug', nextLesson.slug)}
                  className="course-lesson__nav-btn course-lesson__nav-btn--next"
                >
                  <div>
                    <span className="course-lesson__nav-label">
                      SIGUIENTE <span className="kbd-badge">→</span>
                    </span>
                    <span className="course-lesson__nav-title">{nextLesson.title}</span>
                  </div>
                  <Icon name="chevron-right" />
                </Link>
              ) : <div />}
            </nav>

            {/* Comments section */}
            <div className="course-lesson__comments" style={{ marginTop: 'var(--space-8)' }}>
              <BlogComments lessonId={lesson.id} />
            </div>
          </article>

          {/* Right Sidebar Syllabus */}
          <aside className={`course-lesson__sidebar ${isSyllabusMobileOpen ? 'course-lesson__sidebar--open' : ''}`}>
            
            {/* Syllabus Navigation Sidebar */}
            {allLessons.length > 0 && (
              <div className="course-lesson__sidebar-card course-lesson__syllabus-card outsider__feed-item animate-slide-up delay-1">
                <h3 className="course-lesson__sidebar-title">ÍNDICE DE LECCIONES</h3>
                <ul className="course-lesson__syllabus-list">
                  {allLessons.map((item, idx) => {
                    const isCurrent = item.id === lesson.id
                    const isItemCompleted = !!progress[item.id]
                    return (
                      <li 
                        key={item.id} 
                        className={`course-lesson__syllabus-item ${isCurrent ? 'course-lesson__syllabus-item--active' : ''} ${isItemCompleted ? 'course-lesson__syllabus-item--completed' : ''}`}
                      >
                        <Link 
                          to={ROUTES.COURSE_LESSON.replace(':slug', course.slug).replace(':lessonSlug', item.slug)}
                          className="course-lesson__syllabus-link"
                          onClick={() => setIsSyllabusMobileOpen(false)}
                        >
                          <span className="course-lesson__syllabus-status">
                            {isItemCompleted ? (
                              <Icon name="check" size={14} className="completed-check-icon" />
                            ) : (
                              <span>◎</span>
                            )}
                          </span>
                          <span className="course-lesson__syllabus-text">
                            {String(idx + 1).padStart(2, '0')}. {item.title}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Floating HUD Reader Console */}
      <div className={`reader-hud ${showHud ? 'reader-hud--visible' : ''}`}>
        <div className="reader-hud__container">
          <div className="reader-hud__progress-bar" style={{ width: `${scrollPercent}%` }} />
          
          <div className="reader-hud__content">
            <div className="reader-hud__info">
              <span className="reader-hud__percent">{Math.round(scrollPercent)}%</span>
              <span className="reader-hud__divider">//</span>
              <span className="reader-hud__lesson-title" title={lesson.title}>
                {lesson.title}
              </span>
            </div>
            
            <div className="reader-hud__controls">
              {/* Font Size group */}
              <div className="reader-hud__group">
                <button 
                  className={`hud-btn ${fontSize === 'sm' ? 'hud-btn--active' : ''}`}
                  onClick={() => setFontSize('sm')}
                  title="Texto Chico"
                >
                  A-
                </button>
                <button 
                  className={`hud-btn ${fontSize === 'md' ? 'hud-btn--active' : ''}`}
                  onClick={() => setFontSize('md')}
                  title="Texto Normal"
                >
                  A
                </button>
                <button 
                  className={`hud-btn ${fontSize === 'lg' ? 'hud-btn--active' : ''}`}
                  onClick={() => setFontSize('lg')}
                  title="Texto Grande"
                >
                  A+
                </button>
              </div>
              
              <span className="reader-hud__divider">//</span>

              {/* Theme Selection group */}
              <div className="reader-hud__group">
                <button 
                  className={`hud-btn hud-btn--theme ${readingTheme === 'retro-dark' ? 'hud-btn--active' : ''}`}
                  onClick={() => setReadingTheme('retro-dark')}
                  title="Retro"
                >
                  RETRO
                </button>
                <button 
                  className={`hud-btn hud-btn--theme ${readingTheme === 'high-contrast' ? 'hud-btn--active' : ''}`}
                  onClick={() => setReadingTheme('high-contrast')}
                  title="Contraste"
                >
                  CONTRASTE
                </button>
                <button 
                  className={`hud-btn hud-btn--theme ${readingTheme === 'amber-terminal' ? 'hud-btn--active' : ''}`}
                  onClick={() => setReadingTheme('amber-terminal')}
                  title="Ámbar"
                >
                  AMBAR
                </button>
                <button 
                  className={`hud-btn hud-btn--theme ${readingTheme === 'green-terminal' ? 'hud-btn--active' : ''}`}
                  onClick={() => setReadingTheme('green-terminal')}
                  title="Verde"
                >
                  VERDE
                </button>
              </div>
              
              <span className="reader-hud__divider">//</span>

              {/* Complete / Checkbox status */}
              <button 
                className={`hud-btn hud-btn--complete ${isCompleted ? 'hud-btn--complete-active' : ''}`}
                onClick={toggleCompletion}
                title={isCompleted ? 'Desmarcar lección' : 'Marcar como completada'}
              >
                <Icon name={isCompleted ? 'check' : 'circle'} size={12} />
                <span className="hud-btn__text">{isCompleted ? 'HECHO' : 'COMPLETAR'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

