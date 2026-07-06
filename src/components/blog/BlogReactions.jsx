import { useBlogReactions } from '../../features/blog/useBlogReactions'
import { useVisitorTracker } from '../../features/visitor/hooks/useVisitorTracker'
import Icon from '../ui/Icon'
import './BlogReactions.css'

export function BlogReactions({ postId }) {
  // Only call hooks if we're inside standard component execution
  // Getting visitorId from localStorage (set by useVisitorTracker in PageWrapper)
  const visitorId = localStorage.getItem('hachimaki_visitor_id')
  
  const { boostCount, hasBoosted, addBoost, loading } = useBlogReactions(postId, visitorId)

  const handleBoost = async () => {
    if (hasBoosted || loading) return
    await addBoost()
  }

  return (
    <div className="blog-reactions">
      <div className="blog-reactions__terminal-line">
        <span className="blog-reactions__prompt">{'>'}</span>
        <span className="blog-reactions__text">PREPARANDO RAYO TRACTOR...</span>
      </div>
      
      <div className="blog-reactions__controls">
        <button 
          className={`blog-reactions__btn ${hasBoosted ? 'blog-reactions__btn--active' : ''}`}
          onClick={handleBoost}
          disabled={hasBoosted || loading}
          type="button"
        >
          <span className="blog-reactions__icon">
            <Icon name={hasBoosted ? 'alien' : 'ship'} />
          </span>
          <span className="blog-reactions__btn-text">
            {hasBoosted ? '[+] SEÑAL ABDUCIDA' : '[+] INICIAR ABDUCCIÓN'}
          </span>
        </button>

        <div className="blog-reactions__stats">
          <span className="blog-reactions__stat-value">{boostCount}</span>
          <span className="blog-reactions__stat-label">ABDUCCIONES</span>
        </div>
      </div>
    </div>
  )
}
