import React from 'react'
import Icon from '../ui/Icon'
import { formatBytes } from '../../utils/formatBytes'
import { getAvatarIcon } from '../../utils/getAvatarIcon'

export default function NexusPeerLibraryModal({ peer, onDownload, onPing, onClose }) {
  if (!peer) return null

  const isOnline = peer.is_online
  const files = peer.files || []

  return (
    <div className="nexus-modal-overlay">
      <div className="nexus-modal">
        
        {/* Header */}
        <div className="nexus-modal__header">
          <div className="nexus-modal__header-user">
            <div className="nexus-modal__header-avatar">
              <Icon name={getAvatarIcon(peer.visitor_id)} className="text-accent" size={20} />
              <div className={`nexus-modal__header-avatar-status ${isOnline ? 'nexus-modal__header-avatar-status--online' : 'nexus-modal__header-avatar-status--offline'}`}></div>
            </div>
            <div className="nexus-modal__header-info">
              <h2>
                NEON_{peer.visitor_id.substring(0, 4).toUpperCase()}
              </h2>
              <p>
                ÚLTIMA CONEXIÓN: {new Date(peer.last_seen).toLocaleString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="nexus-modal__close-btn">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="nexus-modal__body">
          <h3 className="nexus-modal__section-title">
            <Icon name="folder" /> BIBLIOTECA DEL TERMINAL
            <span className="nexus-modal__count-badge">{files.length} ARCHIVOS</span>
          </h3>

          {files.length === 0 ? (
            <div className="modal-file-list__empty">
              <Icon name="folder-off" size={32} className="modal-file-list__empty-icon" />
              <p>EL TERMINAL NO HA COMPARTIDO ARCHIVOS.</p>
            </div>
          ) : (
            <div className="modal-file-list">
              {files.map(file => {
                const ext = file.name.split('.').pop().toUpperCase()
                
                return (
                  <div key={file.id} className="modal-file-item">
                    <div className="modal-file-item__info">
                      <div className="modal-file-item__name" title={file.name}>
                        {file.name}
                      </div>
                      <div className="modal-file-item__meta">
                        <span className="modal-file-item__type">
                          <Icon name="file" size={12} /> {ext.substring(0, 4)}
                        </span>
                        <span>{formatBytes(file.size)}</span>
                        <span className="opacity-50 hidden sm:inline-block border-l border-border pl-2 ml-2">
                          MIME: {file.type || 'unknown'}
                        </span>
                        <span className="opacity-50 hidden sm:inline-block border-l border-border pl-2 ml-2 font-mono text-[9px] mt-0.5">
                          HASH: {file.id ? Array.from(file.id).reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0).toString(16).toUpperCase().padStart(8, '0').slice(-8) : '00000000'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="modal-file-item__btn-wrapper">
                      {isOnline ? (
                        <button 
                          onClick={() => {
                            onDownload(peer.visitor_id, file)
                            onClose()
                          }}
                          className="modal-file-item__btn"
                        >
                          <Icon name="download" size={14} /> Interceptar
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            onPing(peer.visitor_id, file.id, file.name)
                            onClose()
                          }}
                          className="modal-file-item__btn modal-file-item__btn--ping"
                        >
                          <Icon name="notification" size={14} /> Transmitir Alerta
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
