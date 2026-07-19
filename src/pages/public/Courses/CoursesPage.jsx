import { useCourses } from '../../../features/courses/useCourses'
import { PageLoader } from '../../../components/ui/PageLoader'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Badge } from '../../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../lib/constants'
import { EmptyState } from '../../../components/ui/EmptyState'
import Icon from '../../../components/ui/Icon'
import './CoursesPage.css'

export function CoursesPage() {
  const { courses, loading, error } = useCourses()

  if (loading) return <PageLoader />

  if (error) {
    return (
      <PageWrapper>
        <div className="vhs-scanlines vhs-noise"></div>
        <div className="courses-empty" style={{ borderColor: 'var(--color-danger)' }}>
          <span className="courses-empty-icon"><Icon name="warning-diamond" /></span>
          <span>ERROR DE TRANSMISIÓN</span>
          <span className="courses-empty-sub">{error}</span>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="vhs-scanlines vhs-noise"></div>
      <div className="courses-container">
        
        {/* Header */}
        <header className="courses-header animate-slide-up">
          <div className="courses-header__top">
            <h1 className="courses-title">
              TUTORIALES
              <span className="courses-badge-active">SEÑAL ACTIVA</span>
            </h1>
          </div>
          <p className="courses-subtitle">
            Guías paso a paso, series y cursos completos de tecnología.
          </p>
        </header>

        {/* Courses Feed / Grid */}
        {courses.length === 0 ? (
          <div className="courses-empty">
            <span className="courses-empty-icon">◎</span>
            <span>NO SE ENCONTRARON SEÑALES</span>
            <span className="courses-empty-sub">
              Las guías y tutoriales aparecerán aquí una vez publicados.
            </span>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course, index) => {
              const difficultyVariant = 
                course.difficulty?.toLowerCase() === 'avanzado' ? 'danger' :
                course.difficulty?.toLowerCase() === 'intermedio' ? 'warning' :
                course.difficulty?.toLowerCase() === 'principiante' ? 'success' : 'default';

              return (
                <Link
                  key={course.id}
                  to={ROUTES.COURSE_DETAIL.replace(':slug', course.slug)}
                  className={`course-card animate-slide-up delay-${Math.min(index + 1, 6)}`}
                >
                  <div className="course-card__header">
                    <span className="course-card__id">TUT-{String(index + 1).padStart(3, '0')}</span>
                    <Badge variant={difficultyVariant} size="sm">
                      {course.difficulty || 'Principiante'}
                    </Badge>
                  </div>
                  <h2 className="course-card__title">{course.title}</h2>
                  <p className="course-card__description">{course.description}</p>
                  <div className="course-card__footer">
                    <span className="course-card__category">
                      <Icon name="folder" size={16} /> {course.category || 'TUTORIAL'}
                    </span>
                    <span className="course-card__action">
                      DECODIFICAR <Icon name="arrow-right" size={16} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

