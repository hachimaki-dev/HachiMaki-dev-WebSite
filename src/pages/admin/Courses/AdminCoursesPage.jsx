import { useNavigate } from 'react-router-dom'
import { useCoursesAdmin } from '../../../features/courses/useCoursesAdmin'
import { Button } from '../../../components/ui/Button'
import { PageLoader } from '../../../components/ui/PageLoader'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ROUTES } from '../../../lib/constants'
import { formatDate } from '../../../utils/formatDate'
import Icon from '../../../components/ui/Icon'
import './AdminCoursesPage.css'

export function AdminCoursesPage() {
  const { courses, loading, error, remove, togglePublished } = useCoursesAdmin()
  const navigate = useNavigate()

  if (loading) return <PageLoader />
  if (error) return <div className="error-message">Error: {error}</div>

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Seguro que quieres borrar el curso "${title}" y todas sus lecciones?`)) return
    try {
      await remove(id)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      await togglePublished(id, !currentStatus)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="admin-page page-enter">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Cursos y Tutoriales</h1>
          <p className="admin-page__subtitle">Gestiona tus series de tutoriales</p>
        </div>
        <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_COURSE_NEW)}>
          + Nuevo Curso
        </Button>
      </header>

      {courses.length === 0 ? (
        <EmptyState 
          icon="book"
          title="Sin cursos"
          description="Aún no has creado ningún curso o tutorial."
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Título / Categoría</th>
                <th>Lecciones</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <button
                      className={`status-badge ${course.published ? 'status-badge--active' : 'status-badge--inactive'}`}
                      onClick={() => handleToggle(course.id, course.published)}
                      title="Click para cambiar estado"
                    >
                      <span className="status-badge__dot"></span>
                      {course.published ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                  <td>
                    <span 
                      className="admin-table__primary-link"
                      onClick={() => navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', course.id))}
                      style={{ cursor: 'pointer', fontWeight: 'bold', display: 'block', marginBottom: 'var(--space-1)' }}
                      title="Editar Curso"
                    >
                      {course.title}
                    </span>
                    <div className="admin-table__secondary">{course.category || 'Sin categoría'} &bull; {course.difficulty || 'Básico'}</div>
                  </td>
                  <td>{course.course_lessons?.[0]?.count || 0} lecciones</td>
                  <td>
                    <div className="admin-table__secondary">
                      {formatDate(course.created_at)}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="admin-table__actions">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(ROUTES.ADMIN_COURSE_EDIT.replace(':id', course.id))}
                        title="Editar"
                      >
                        <Icon name="magic-edit" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(course.id, course.title)}
                        title="Eliminar"
                        style={{ color: 'var(--color-error)' }}
                      >
                        <Icon name="trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
