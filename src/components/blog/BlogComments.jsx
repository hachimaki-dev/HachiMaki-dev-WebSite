import { useState } from 'react'
import { useBlogComments } from '../../features/blog/useBlogComments'
import { formatDate } from '../../utils/formatDate'
import Icon from '../ui/Icon'
import './BlogComments.css'

export function BlogComments({ postId, courseId, lessonId }) {
  const visitorId = localStorage.getItem('hachimaki_visitor_id')
  const { comments, loading, addComment, generateAlias } = useBlogComments(
    { postId, courseId, lessonId },
    visitorId
  )
  
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const myAlias = generateAlias(visitorId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const res = await addComment(content)
    if (res.success) {
      setContent('')
    } else {
      setError(res.error)
    }

    setIsSubmitting(false)
  }

  return (
    <section className="blog-comments">
      <div className="blog-comments__header">
        <h3 className="blog-comments__title">
          <Icon name="terminal" /> TERMINAL DE ENLACE DE DATOS
        </h3>
        <span className="blog-comments__status">ESTADO: CONECTADO</span>
      </div>

      <div className="blog-comments__list">
        {loading ? (
          <div className="blog-comments__loading">Sincronizando registros...</div>
        ) : comments.length === 0 ? (
          <div className="blog-comments__empty">No hay paquetes de datos registrados. Sé el primero.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={`blog-comment ${c.visitor_id === visitorId ? 'blog-comment--mine' : ''}`}>
              <div className="blog-comment__meta">
                <span className="blog-comment__author">[{c.alias}]</span>
                <span className="blog-comment__date">{formatDate(c.created_at)}</span>
              </div>
              <p className="blog-comment__content">{c.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="blog-comments__form" onSubmit={handleSubmit}>
        <div className="blog-comments__form-header">
          <span>{myAlias}@hachimaki.dev:~$</span>
        </div>
        <textarea
          className="blog-comments__input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu mensaje en la terminal..."
          rows="3"
          required
          maxLength="500"
          disabled={isSubmitting}
        />
        <div className="blog-comments__footer">
          {error && <span className="blog-comments__error">{error}</span>}
          <button 
            type="submit" 
            className="blog-comments__submit"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR PAQUETE'}
          </button>
        </div>
      </form>
    </section>
  )
}
