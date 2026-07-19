import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCourses } from '../../../features/courses/useCourses'
import { PageLoader } from '../../../components/ui/PageLoader'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Badge } from '../../../components/ui/Badge'
import { ROUTES } from '../../../lib/constants'
import { formatDate } from '../../../utils/formatDate'
import Icon from '../../../components/ui/Icon'
import { SEO } from '../../../components/ui/SEO'
import { BlogComments } from '../../../components/blog/BlogComments'
import './CourseDetail.css'

export function CourseDetailPage() {
  const { slug } = useParams()
  const { getCourseBySlug } = useCourses()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({})

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseBySlug(slug)
        setCourse(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [slug, getCourseBySlug])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hachimaki_course_progress')
      if (saved) {
        setProgress(JSON.parse(saved))
      }
    } catch (e) {
      // Ignore
    }
  }, [])

  if (loading) return <PageLoader />
  
  if (error) {
    return (
      <PageWrapper narrow>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="course-detail-error">
          <Icon name="warning-diamond" className="course-detail-error__icon" />
          <span>ERROR DE TRANSMISIÓN</span>
          <span className="course-detail-error__sub">{error}</span>
          <Link to={ROUTES.COURSES} className="course-detail-error__btn">
            VOLVER A TUTORIALES
          </Link>
        </div>
      </PageWrapper>
    )
  }

  if (!course) {
    return (
      <PageWrapper narrow>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="course-detail-error">
          <Icon name="warning-diamond" className="course-detail-error__icon" />
          <span>CURSO NO ENCONTRADO</span>
          <Link to={ROUTES.COURSES} className="course-detail-error__btn">
            VOLVER A TUTORIALES
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const lessons = course.course_lessons || []
  const completedCount = lessons.filter(l => !!progress[l.id]).length
  const percent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const renderProgressBar = () => {
    if (lessons.length === 0) return null
    const totalBlocks = 10
    const filledBlocks = Math.round(percent / 10)
    const emptyBlocks = totalBlocks - filledBlocks
    const bar = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks)
    return (
      <div className="course-progress animate-slide-up delay-2">
        <div className="course-progress__info">
          <span className="course-progress__label">PROGRESO DE LECTURA</span>
          <span className="course-progress__percentage">{percent}%</span>
        </div>
        <div className="course-progress__bar-wrap">
          <span className="course-progress__bar-visual">{bar}</span>
          <span className="course-progress__stats">{completedCount}/{lessons.length} LECCIONES</span>
        </div>
      </div>
    )
  }

  const difficultyVariant = 
    course.difficulty?.toLowerCase() === 'avanzado' ? 'danger' :
    course.difficulty?.toLowerCase() === 'intermedio' ? 'warning' :
    course.difficulty?.toLowerCase() === 'principiante' ? 'success' : 'default';

  return (
    <PageWrapper narrow className="course-detail-wrapper">
      <SEO 
        title={course.title} 
        description={course.description} 
        type="article"
        image={course.cover_url}
        url={window.location.href}
      />
      <div className="vhs-scanlines vhs-noise"></div>
      
      <div className="course-detail">
        <header className="course-detail__header animate-slide-up">
          <div className="course-detail__meta">
            <Badge variant="accent" size="sm" className="course-detail__badge">
              <Icon name="folder" size={14} /> {course.category || 'TUTORIAL'}
            </Badge>
            <Badge variant={difficultyVariant} size="sm" className="course-detail__badge">
              <Icon name="bar-chart" size={14} /> {course.difficulty || 'Principiante'}
            </Badge>
            <span className="course-detail__date">
              <Icon name="calendar" size={14} /> {formatDate(course.published_at || course.created_at).toUpperCase()}
            </span>
          </div>
          <h1 className="course-detail__title">{course.title}</h1>
          <p className="course-detail__description">{course.description}</p>

          {renderProgressBar()}
        </header>

        <div className="course-detail__content animate-slide-up delay-1">
          {course.cover_url && (
            <div className="course-detail__cover-wrapper">
              <img src={course.cover_url} alt={course.title} className="course-detail__cover" />
            </div>
          )}

          <div className="course-detail__lessons">
            <h2 className="course-detail__lessons-title">ÍNDICE DEL CURSO //_</h2>
            
            {lessons.length === 0 ? (
              <div className="course-detail__no-lessons">
                <span>SEÑAL INCOMPLETA</span>
                <p>Las lecciones de este curso aún no han sido publicadas.</p>
              </div>
            ) : (
              <div className="lessons-list">
                {lessons.map((lesson, idx) => {
                  const isCompleted = !!progress[lesson.id]
                  return (
                    <Link 
                      key={lesson.id} 
                      to={ROUTES.COURSE_LESSON.replace(':slug', course.slug).replace(':lessonSlug', lesson.slug)}
                      className={`lesson-link-card ${isCompleted ? 'lesson-link-card--completed' : ''}`}
                    >
                      <div className="lesson-link-card__number-wrap">
                        <span className="lesson-link-card__number">{String(idx + 1).padStart(2, '0')}</span>
                        {isCompleted && (
                          <span className="lesson-link-card__check" title="Completada">
                            <Icon name="check" size={16} />
                          </span>
                        )}
                      </div>
                      <div className="lesson-link-card__info">
                        <h3 className="lesson-link-card__title">
                          {lesson.title}
                        </h3>
                        {lesson.excerpt && <p className="lesson-link-card__excerpt">{lesson.excerpt}</p>}
                        <div className="lesson-link-card__footer-meta">
                          <span className="lesson-link-card__meta-item">
                            <Icon name="clock" size={14} /> {lesson.reading_time_min} MIN LECT.
                          </span>
                          {isCompleted && (
                            <span className="lesson-link-card__completed-badge">
                              [COMPLETADO]
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="lesson-link-card__icon">
                        <Icon name="chevron-right" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="course-detail__comments" style={{ marginTop: 'var(--space-8)' }}>
            <BlogComments courseId={course.id} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

