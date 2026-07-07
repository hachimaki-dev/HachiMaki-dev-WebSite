import React, { useState, useEffect, useRef } from 'react'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { useVisitorTracker } from '../../../features/visitor/hooks/useVisitorTracker'
import { useNexusLibrary } from '../../../features/nexus/hooks/useNexusLibrary'
import NexusTerminalCard from '../../../components/nexus/NexusTerminalCard'
import NexusPeerLibraryModal from '../../../components/nexus/NexusPeerLibraryModal'
import { createNexusSignaling } from '../../../features/nexus/lib/nexusSignaling'
import { createNexusPeer } from '../../../features/nexus/lib/p2pDataChannel'
import { formatBytes } from '../../../utils/formatBytes'
import { getAvatarIcon } from '../../../utils/getAvatarIcon'
import './nexus.css'

export default function NexusPage() {
  const { visitorId, isLoading: isVisitorLoading } = useVisitorTracker()
  const {
    displayFiles,
    peers,
    alerts,
    myStats,
    nexusActivity,
    loading: isNexusLoading,
    hasFileSystemAccess,
    addFiles,
    reactivateFile,
    removeFile,
    getFileToShare,
    sendPing,
    incrementStat,
    logActivity
  } = useNexusLibrary(visitorId)

  const [transferState, setTransferState] = useState(null) // null, 'waiting_approval', 'connecting', 'transferring'
  const [progress, setProgress] = useState(0)
  const [activeTransferName, setActiveTransferName] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  
  // Pending request for Uploader
  const [incomingRequest, setIncomingRequest] = useState(null)

  // New UI state
  const [selectedPeer, setSelectedPeer] = useState(null)
  const [activeTab, setActiveTab] = useState('ARCHIVOS')
  const [fileSearchQuery, setFileSearchQuery] = useState('')
  const [peerSearchQuery, setPeerSearchQuery] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const signalingRef = useRef(null)
  const peerRef = useRef(null)
  const earlyIceCandidates = useRef([])

  useEffect(() => {
    if (!visitorId) return

    const handleSignalingMessage = async (msg) => {
      try {
        if (msg.type === 'request_download') {
          console.log('[WEB_RTC_SIGNALING] Received request_download:', msg)
          const { fileId, fileName } = msg.payload
          const file = await getFileToShare(fileId)
          if (!file) {
            await signalingRef.current.send(msg.sender_id, 'reject_download', { reason: 'ARCHIVO NO ENCONTRADO EN BÓVEDA' })
            return
          }
          setIncomingRequest({
            senderId: msg.sender_id,
            file: file
          })
        } 
        else if (msg.type === 'reject_download') {
          setTransferState(null)
          setToastMessage(`SOLICITUD RECHAZADA: ${msg.payload.reason}`)
        }
        else if (msg.type === 'accept_download') {
          const { fileId, fileName } = msg.payload
          initiateWebRTC(msg.sender_id, { id: fileId, name: fileName })
        }
        else if (msg.type === 'offer') {
          const { fileId, sdp } = msg.payload
          const file = await getFileToShare(fileId)
          if (!file) return 
          
          setTransferState('transferring')
          setActiveTransferName(`SUBIENDO: ${file.name}`)
          setProgress(0)
          setIncomingRequest(null)

          peerRef.current = createNexusPeer({
            onOffer: () => {},
            onAnswer: async (answerSdp) => {
              await signalingRef.current.send(msg.sender_id, 'answer', { sdp: answerSdp })
            },
            onIceCandidate: async (candidate) => {
              await signalingRef.current.send(msg.sender_id, 'ice-candidate', { candidate })
            },
            onStatusChange: (status) => {
              if (status === 'disconnected' || status === 'failed') setTransferState(null)
            },
            onDataChannelOpen: async () => {
              try {
                await peerRef.current.sendFile(file)
                setToastMessage(`TRANSMISIÓN COMPLETADA: ${file.name}`)
                incrementStat('shares_count')
                logActivity('file_shared', { fileName: file.name, targetId: msg.sender_id })
                setTimeout(() => setTransferState(null), 3000)
              } catch (err) {
                console.error('[WEB_RTC_SIGNALING] Error sending file', err)
                setTransferState(null)
              }
            },
            onProgress: setProgress
          })

          await peerRef.current.handleOffer(sdp)
          
          for (const c of earlyIceCandidates.current) {
            await peerRef.current.handleIceCandidate(c)
          }
          earlyIceCandidates.current = []
        } 
        else if (msg.type === 'answer') {
          await peerRef.current?.handleAnswer(msg.payload.sdp)
        } 
        else if (msg.type === 'ice-candidate') {
          if (!peerRef.current) {
            earlyIceCandidates.current.push(msg.payload.candidate)
            return
          }
          try {
             await peerRef.current?.handleIceCandidate(msg.payload.candidate)
          } catch(e) {}
        }
      } catch (err) {
        console.error('Signaling handling error:', err)
      }
    }

    signalingRef.current = createNexusSignaling(visitorId, handleSignalingMessage)
    signalingRef.current.subscribe()

    return () => {
      signalingRef.current?.unsubscribe()
      peerRef.current?.close()
    }
  }, [visitorId, getFileToShare, incrementStat, logActivity])

  const requestDownload = async (targetId, file) => {
    setTransferState('waiting_approval')
    setActiveTransferName(`SOLICITANDO: ${file.name}`)
    setProgress(0)
    await signalingRef.current.send(targetId, 'request_download', { fileId: file.id, fileName: file.name })
  }

  const initiateWebRTC = async (targetId, file) => {
    setTransferState('connecting')
    setActiveTransferName(`DESCARGANDO: ${file.name}`)
    setProgress(0)
    
    peerRef.current = createNexusPeer({
      onOffer: async (sdp) => {
        await signalingRef.current.send(targetId, 'offer', { fileId: file.id, sdp })
      },
      onAnswer: () => {},
      onIceCandidate: async (candidate) => {
        await signalingRef.current.send(targetId, 'ice-candidate', { candidate })
      },
      onStatusChange: (status) => {
         if (status === 'connected') setTransferState('transferring')
         if (status === 'disconnected' || status === 'failed') setTransferState(null)
      },
      onProgress: (p) => {
         setProgress(p)
         if (p >= 100) {
            setToastMessage(`INTERCEPCIÓN COMPLETADA: ${file.name}`)
            incrementStat('downloads_count')
            logActivity('download_completed', { fileName: file.name, sourceId: targetId })
            setTimeout(() => setTransferState(null), 3000)
         }
      }
    })

    try {
      await peerRef.current.connect()
      for (const c of earlyIceCandidates.current) {
        await peerRef.current.handleIceCandidate(c)
      }
      earlyIceCandidates.current = []
    } catch (err) {
      setTransferState(null)
    }
  }

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return
    const { senderId, file } = incomingRequest
    await signalingRef.current.send(senderId, 'accept_download', { fileId: file.id, fileName: file.name })
    setIncomingRequest(null)
    setTransferState('connecting')
    setActiveTransferName(`PREPARANDO SUBIDA: ${file.name}`)
  }

  const handleRejectRequest = async () => {
    if (!incomingRequest) return
    const { senderId } = incomingRequest
    await signalingRef.current.send(senderId, 'reject_download', { reason: 'CONEXIÓN DENEGADA POR EL USUARIO' })
    setIncomingRequest(null)
  }

  const handleAddFilesWrapper = async () => {
    await addFiles()
    logActivity('file_uploaded', { count: 1 })
  }

  if (isVisitorLoading || isNexusLoading) return <PageLoader />

  const totalMySize = displayFiles.reduce((acc, f) => acc + f.size, 0)
  
  const filteredFiles = displayFiles.filter(f => f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()))
  
  const activePeers = peers.filter(p => {
    if (!p.is_online) return false
    const secondsSinceLastSeen = (new Date() - new Date(p.last_seen)) / 1000
    return secondsSinceLastSeen < 45
  })

  const filteredPeers = activePeers.filter(p => {
    const term = peerSearchQuery.toLowerCase()
    const id = p.visitor_id.toLowerCase()
    const neonName = `neon_${id}`
    const nexoName = `nexo_${id}`
    const terminalName = `terminal_${id}`
    return id.includes(term) || neonName.includes(term) || nexoName.includes(term) || terminalName.includes(term)
  })

  return (
    <PageWrapper className="vhs-scanlines vhs-noise relative bg-bg">
      
      {/* Top Header */}
      <header className="nexus-header">
        <div className="nexus-header__content">
          <div className="nexus-header__title-wrapper">
            <h1>
              <Icon name="git-branch" className="text-accent" />
              SISTEMA DE INTERCAMBIO P2P
            </h1>
            <p>Comparte archivos de forma descentralizada y segura</p>
          </div>
          <div className="nexus-header__actions">
            <button className="nexus-header__upload-btn" onClick={handleAddFilesWrapper}>
              <Icon name="plus" /> Subir archivos
            </button>
            <div className="nexus-header__avatar">
              <Icon name={getAvatarIcon(visitorId)} className="text-text" size={20} />
              <div className="nexus-header__avatar-status"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="nexus-container">
        
        {/* Toasts */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-toast bg-bg bg-opacity-95 backdrop-blur-md border border-accent text-text font-mono p-4 rounded shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center gap-4 animate-slide-up">
            <Icon name="check-circle" className="text-accent" />
            <span className="text-sm tracking-wider">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-muted hover:text-text transition-colors">
              <Icon name="close" />
            </button>
          </div>
        )}

        {/* Incoming Request Banner */}
        {incomingRequest && (
          <Card className="mb-8 p-6 border-warning bg-warning bg-opacity-10 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse-slow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Icon name="warning-box" size={32} className="text-warning mt-1" />
                <div>
                  <h3 className="font-sans font-black text-xl text-text tracking-wide">SOLICITUD DE INTERCEPCIÓN</h3>
                  <p className="font-mono text-sm text-muted mt-1">
                    El Terminal <span className="text-warning font-bold">{incomingRequest.senderId.substring(0, 6).toUpperCase()}</span> ha solicitado el archivo:
                  </p>
                  <p className="font-mono text-text font-bold mt-2 bg-bg px-3 py-1 rounded inline-block border border-surface">
                    {incomingRequest.file.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-error text-error hover:bg-error hover:bg-opacity-10" onClick={handleRejectRequest}>
                  <Icon name="close" /> DENEGAR
                </Button>
                <Button variant="primary" className="flex-1 md:flex-none bg-warning hover:bg-opacity-80 text-bg" onClick={handleAcceptRequest}>
                  <Icon name="check" /> PERMITIR
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Transfer Status */}
        {transferState && !incomingRequest && (
          <Card className="mb-8 p-6 border-accent bg-bg bg-opacity-90 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface">
              <div 
                className="h-full bg-accent transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,1)]" 
                style={{ width: transferState === 'waiting_approval' ? '100%' : `${progress}%` }}
              ></div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono mt-2">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative">
                  <Icon name={transferState === 'waiting_approval' ? 'clock' : 'sync'} size={32} className={`text-accent ${transferState === 'transferring' ? 'animate-spin' : 'animate-pulse'}`} />
                  <div className="absolute inset-0 bg-accent blur-md opacity-40"></div>
                </div>
                <div>
                  <p className="text-accent font-bold text-lg tracking-wider">{activeTransferName}</p>
                  <p className="text-xs text-muted mt-1">
                    {transferState === 'waiting_approval' ? 'ESPERANDO CONFIRMACIÓN DEL TERMINAL REMOTO...' : 
                     transferState === 'connecting' ? 'ESTABLECIENDO CONEXIÓN DIRECTA...' : 
                     'MANTÉN LA PESTAÑA ABIERTA DURANTE LA TRANSMISIÓN.'}
                  </p>
                </div>
              </div>
              
              {transferState === 'transferring' && (
                <div className="text-4xl font-black text-surface opacity-50 tracking-tighter w-24 text-right">
                  {progress}%
                </div>
              )}
              
              {transferState === 'waiting_approval' && (
                <Button variant="outline" size="sm" onClick={() => setTransferState(null)} className="shrink-0 text-xs text-muted border-muted">
                  CANCELAR
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* 3-Column Layout */}
        <div className="nexus-grid">
          
          {/* COLUMN 1: Profile (Left) */}
          <aside className="nexus-sidebar">
            <div className="nexus-profile-card">
              <div className="nexus-profile-card__avatar-glow">
                <Icon name={getAvatarIcon(visitorId)} className="text-accent opacity-80" size={64} />
              </div>
              <h2 className="nexus-profile-card__name">
                NEXO_{visitorId.substring(0, 4).toUpperCase()}
              </h2>
              <p className="nexus-profile-card__role">Usuario anónimo</p>
              <div className="nexus-profile-card__status">
                <div className="status-dot-pulsing"></div>
                En línea
              </div>
            </div>
          </aside>

          {/* COLUMN 2: Library (Center) */}
          <section className="nexus-main">
            <div className="nexus-library-title">
              <h2>MI BIBLIOTECA</h2>
              <p>Tu espacio en la red</p>
            </div>

            {/* KPIs */}
            <div className="nexus-kpi-grid">
              <div className="kpi-card">
                <div className="kpi-card__icon-wrapper">
                  <Icon name="folder" size={20} />
                </div>
                <div className="kpi-card__info">
                  <span className="kpi-card__value">{displayFiles.length}</span>
                  <span className="kpi-card__label">Archivos</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--green">
                  <Icon name="download" size={20} />
                </div>
                <div className="kpi-card__info">
                  <span className="kpi-card__value">{totalMySize > 0 ? formatBytes(totalMySize) : '0 B'}</span>
                  <span className="kpi-card__label">Tamaño total</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--blue">
                  <Icon name="eye" size={20} />
                </div>
                <div className="kpi-card__info">
                  <span className="kpi-card__value">{myStats.downloads_count}</span>
                  <span className="kpi-card__label">Descargas</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-card__icon-wrapper">
                  <Icon name="upload" size={20} />
                </div>
                <div className="kpi-card__info">
                  <span className="kpi-card__value">{myStats.shares_count}</span>
                  <span className="kpi-card__label">Compartidos</span>
                </div>
              </div>
            </div>

            {/* Files Container */}
            <div className="nexus-library-card">
              <div className="nexus-library-card__bar">
                <div className="library-tabs">
                  <button 
                    className={`library-tab-btn ${activeTab === 'ARCHIVOS' ? 'library-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab('ARCHIVOS')}
                  >
                    Archivos
                  </button>
                  <button 
                    className={`library-tab-btn ${activeTab === 'COMPARTIDOS' ? 'library-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab('COMPARTIDOS')}
                  >
                    Compartidos
                  </button>
                  <button 
                    className={`library-tab-btn ${activeTab === 'FAVORITOS' ? 'library-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab('FAVORITOS')}
                  >
                    Favoritos
                  </button>
                </div>
                <div className="library-search-container">
                  <div className="library-search-input-wrapper">
                    <Icon name="search" className="library-search-icon" size={14} />
                    <input 
                      type="text" 
                      placeholder="Buscar en mi biblioteca..." 
                      className="library-search-input"
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="library-filter-btn">
                    <Icon name="sort" size={14} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tamaño</th>
                      <th>Tipo</th>
                      <th>Agregado</th>
                      <th>Descargas</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted" style={{ padding: 'var(--space-8) 0' }}>
                          <Icon name="folder-off" size={32} style={{ marginBottom: 'var(--space-2)', opacity: 0.5 }} />
                          <div>NO HAY ARCHIVOS</div>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map(file => {
                        const ext = file.name.split('.').pop().toLowerCase()
                        let badgeClass = 'file-row__badge--generic'
                        if (['pdf'].includes(ext)) badgeClass = 'file-row__badge--pdf'
                        if (['mkv', 'mp4'].includes(ext)) badgeClass = 'file-row__badge--mkv'
                        if (['txt'].includes(ext)) badgeClass = 'file-row__badge--txt'

                        return (
                          <tr key={file.id} className="file-row">
                            <td>
                              <div className="file-row__name-cell">
                                <Icon name="file" className="file-row__icon" size={16} />
                                <span className="file-row__name-text" title={file.name}>{file.name}</span>
                              </div>
                            </td>
                            <td>{formatBytes(file.size)}</td>
                            <td>
                              <span className={`file-row__badge ${badgeClass}`}>{ext.toUpperCase()}</span>
                            </td>
                            <td className="text-muted">{file.isActive ? 'Hace 2 h' : 'Inactivo'}</td>
                            <td className="text-muted">18</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                {!file.isActive && !file.isEphemeral && (
                                  <button onClick={() => reactivateFile(file.id)} className="file-row__options-btn" title="Reactivar">
                                    <Icon name="power" size={14} />
                                  </button>
                                )}
                                <button onClick={() => removeFile(file.id)} className="file-row__options-btn" title="Eliminar">
                                  <Icon name="trash" size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dropzone */}
              <div className="nexus-dropzone" onClick={handleAddFilesWrapper}>
                <Icon name="upload" size={24} className="nexus-dropzone__icon" />
                <p className="nexus-dropzone__text">
                  Arrastra archivos aquí o <span className="nexus-dropzone__highlight">haz clic para subir</span>
                </p>
                <p className="nexus-dropzone__subtext">Cualquier tipo de archivo. Sin límites.</p>
              </div>
            </div>

            {!hasFileSystemAccess && (
              <div className="nexus-fallback-warning">
                <Icon name="alert" className="nexus-fallback-warning__icon" size={16} />
                <span>TERMINAL NO PERSISTENTE: Las conexiones se perderán al salir de la página debido a políticas de seguridad del navegador.</span>
              </div>
            )}
          </section>

          {/* COLUMN 3: Users (Right) */}
          <aside className="nexus-right-sidebar">
            <div className="nexus-users-card">
              <div className="nexus-users-card__header">
                <h3>USUARIOS EN LÍNEA</h3>
                <p>Explora bibliotecas de otros usuarios</p>
                <div className="nexus-users-card__controls">
                  <div className="peer-search-input-wrapper">
                    <Icon name="search" className="library-search-icon" size={14} />
                    <input 
                      type="text" 
                      placeholder="Buscar usuarios..." 
                      className="peer-search-input"
                      value={peerSearchQuery}
                      onChange={(e) => setPeerSearchQuery(e.target.value)}
                    />
                  </div>
                  <select className="peer-filter-select">
                    <option>Más activos</option>
                  </select>
                </div>
              </div>

              <div className="nexus-users-list">
                {filteredPeers.length === 0 ? (
                  <div className="p-8 text-center text-muted font-mono text-xs opacity-50" style={{ padding: 'var(--space-8) 0' }}>
                    <Icon name="radar" size={32} className="animate-pulse-slow" style={{ marginBottom: 'var(--space-2)' }} />
                    NO SE DETECTAN TERMINALES
                  </div>
                ) : (
                  filteredPeers.map(peer => (
                    <NexusTerminalCard 
                      key={peer.visitor_id} 
                      peer={peer} 
                      onViewLibrary={setSelectedPeer}
                    />
                  ))
                )}
              </div>

              <div className="nexus-users-card__footer">
                <a href="#more" className="nexus-users-card__more-link" onClick={(e) => e.preventDefault()}>
                  Ver más usuarios <Icon name="arrow-right" size={12} />
                </a>
              </div>
            </div>
          </aside>

        </div>

        {/* BOTTOM SECTIONS: Activity and FAQ */}
        <div className="nexus-bottom-grid">
          
          {/* Recent Activity */}
          <div className="nexus-recent-card">
            <div className="nexus-recent-card__header">
              <div className="nexus-recent-card__header-info">
                <h3>ACTIVIDAD RECIENTE</h3>
                <p>Lo que está pasando en tu biblioteca</p>
              </div>
              <button className="nexus-recent-card__more-btn">
                Ver toda la actividad <Icon name="arrow-right" size={12} />
              </button>
            </div>
            
            <div className="nexus-recent-list">
              {nexusActivity.length === 0 ? (
                <p className="text-muted font-mono text-xs opacity-50 text-center py-4" style={{ gridColumn: 'span 2' }}>SIN ACTIVIDAD RECIENTE</p>
              ) : (
                nexusActivity.slice(0, 4).map(act => {
                  let wrapperClass = 'activity-item__icon-wrapper--purple'
                  let iconName = 'plus'
                  let titleText = 'Nuevo archivo subido'
                  
                  if (act.action_type === 'download_completed') {
                    wrapperClass = 'activity-item__icon-wrapper--green'
                    iconName = 'check'
                    titleText = 'Descarga completada'
                  } else if (act.action_type === 'file_shared') {
                    wrapperClass = 'activity-item__icon-wrapper--blue'
                    iconName = 'upload'
                    titleText = 'Archivo compartido'
                  }

                  return (
                    <div key={act.id} className="activity-item">
                      <div className={`activity-item__icon-wrapper ${wrapperClass}`}>
                        <Icon name={iconName} size={16} />
                      </div>
                      <div className="activity-item__content">
                        <div className="activity-item__title">{titleText}</div>
                        <div className="activity-item__filename" title={act.details?.fileName || 'Archivo'}>
                          {act.details?.fileName || 'Varios archivos'}
                        </div>
                        <div className="activity-item__meta">
                          {act.details?.fileSize ? formatBytes(act.details.fileSize) : ''}
                          {act.details?.fileSize ? ' • ' : ''}
                          Ayer
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* How Nexus Works */}
          <div className="nexus-faq-card">
            <h3>¿CÓMO FUNCIONA EL NEXO?</h3>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-item__icon-wrapper">
                  <Icon name="git-branch" size={16} />
                </div>
                <div className="faq-item__info">
                  <h4>Descarga Descentralizada</h4>
                  <p>Los archivos se descargan desde múltiples fuentes simultáneamente.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-item__icon-wrapper">
                  <Icon name="server" size={16} />
                </div>
                <div className="faq-item__info">
                  <h4>Sin Servidores Centrales</h4>
                  <p>No dependemos de servidores centrales, la red es distribuida.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-item__icon-wrapper">
                  <Icon name="link" size={16} />
                </div>
                <div className="faq-item__info">
                  <h4>Conexión Directa</h4>
                  <p>Conecta directamente con otros usuarios para intercambiar archivos.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-item__icon-wrapper">
                  <Icon name="shield" size={16} />
                </div>
                <div className="faq-item__info">
                  <h4>Seguridad P2P</h4>
                  <p>Tus archivos y actividad están protegidos por la red P2P.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer status bar */}
      <footer className="nexus-footer">
        <div className="nexus-footer__content">
          <div className="nexus-footer__status">
            <div className="nexus-footer__status-dot"></div>
            Red P2P activa y descentralizada
          </div>
          <div>
            Descentralizado • Seguro • Sin límites
          </div>
        </div>
      </footer>

      {/* Peer Library Modal */}
      {selectedPeer && (
        <NexusPeerLibraryModal 
          peer={selectedPeer} 
          onDownload={requestDownload}
          onPing={sendPing}
          onClose={() => setSelectedPeer(null)}
        />
      )}

    </PageWrapper>
  )
}
