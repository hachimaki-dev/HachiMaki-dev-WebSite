import Icon from '../ui/Icon'
import { formatBytes } from '../../utils/formatBytes'
import { getAvatarIcon } from '../../utils/getAvatarIcon'

export default function NexusTerminalCard({ peer, onViewLibrary }) {
  const isOnline = peer.is_online
  const files = peer.files || []
  
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0)
  
  return (
    <div className="peer-card">
      <div className="peer-card__header-info">
        <div className="peer-card__avatar-wrapper">
          <Icon name={getAvatarIcon(peer.visitor_id)} className="peer-card__avatar-icon" size={20} />
          <div className={`peer-card__status-dot ${isOnline ? 'peer-card__status-dot--online' : 'peer-card__status-dot--offline'}`}></div>
        </div>
        
        <div className="peer-card__main-info">
          <div className="peer-card__title-row">
            <h3 className="peer-card__title">
              NEON_{peer.visitor_id.substring(0, 4).toUpperCase()}
            </h3>
            {isOnline && <span className="peer-card__online-badge">En línea</span>}
          </div>
          
          <div className="peer-card__stats-row">
            <div className="peer-card__stat-item">
              <span className="peer-card__stat-label">Archivos</span>
              <span className="peer-card__stat-val">{files.length}</span>
            </div>
            <div className="peer-card__stat-item">
              <span className="peer-card__stat-label">Tamaño</span>
              <span className="peer-card__stat-val">{totalSize > 0 ? formatBytes(totalSize) : '0 B'}</span>
            </div>
            <div className="peer-card__stat-item">
              <span className="peer-card__stat-label">Descargas</span>
              <span className="peer-card__stat-val">{peer.downloads_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="peer-card__action">
        <button 
          className="peer-card__btn"
          onClick={() => onViewLibrary(peer)}
        >
          Ver biblioteca
        </button>
      </div>
      
    </div>
  )
}
