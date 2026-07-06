import React, { useState, useEffect, useRef } from 'react'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { PageLoader } from '../../../components/ui/PageLoader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { useVisitorTracker } from '../../../features/visitor/hooks/useVisitorTracker'
import { useNexusLibrary } from '../../../features/nexus/hooks/useNexusLibrary'
import NexusLocalVault from '../../../components/nexus/NexusLocalVault'
import NexusTerminalCard from '../../../components/nexus/NexusTerminalCard'
import { createNexusSignaling } from '../../../features/nexus/lib/nexusSignaling'
import { createNexusPeer } from '../../../features/nexus/lib/p2pDataChannel'

export default function NexusPage() {
  const { visitorId, isLoading: isVisitorLoading } = useVisitorTracker()
  const {
    displayFiles,
    peers,
    alerts,
    loading: isNexusLoading,
    hasFileSystemAccess,
    addFiles,
    reactivateFile,
    removeFile,
    getFileToShare,
    sendPing
  } = useNexusLibrary(visitorId)

  const [transferState, setTransferState] = useState(null) // null, 'waiting_approval', 'connecting', 'transferring'
  const [progress, setProgress] = useState(0)
  const [activeTransferName, setActiveTransferName] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  
  // Pending request for Uploader
  const [incomingRequest, setIncomingRequest] = useState(null)

  const signalingRef = useRef(null)
  const peerRef = useRef(null)

  useEffect(() => {
    if (!visitorId) return

    const handleSignalingMessage = async (msg) => {
      try {
        // --- 1. Downloader requests download ---
        if (msg.type === 'request_download') {
          const { fileId, fileName } = msg.payload
          const file = await getFileToShare(fileId)
          if (!file) {
            await signalingRef.current.send(msg.sender_id, 'reject_download', { reason: 'ARCHIVO NO ENCONTRADO EN BÓVEDA' })
            return
          }
          // Show confirmation modal to Uploader
          setIncomingRequest({
            senderId: msg.sender_id,
            file: file
          })
        } 
        
        // --- 2. Uploader rejected ---
        else if (msg.type === 'reject_download') {
          setTransferState(null)
          setToastMessage(`SOLICITUD RECHAZADA: ${msg.payload.reason}`)
        }
        
        // --- 3. Uploader accepted, Downloader starts WebRTC ---
        else if (msg.type === 'accept_download') {
          const { fileId, fileName } = msg.payload
          initiateWebRTC(msg.sender_id, { id: fileId, name: fileName })
        }

        // --- 4. WebRTC Negotiation ---
        else if (msg.type === 'offer') {
          // Uploader automatically handles offer since they already accepted
          const { fileId, sdp } = msg.payload
          const file = await getFileToShare(fileId)
          if (!file) return // Should not happen, checked earlier
          
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
                setTimeout(() => setTransferState(null), 3000)
              } catch (err) {
                console.error('Error sending file', err)
                setTransferState(null)
              }
            },
            onProgress: setProgress
          })

          await peerRef.current.handleOffer(sdp)
        } 
        
        else if (msg.type === 'answer') {
          await peerRef.current?.handleAnswer(msg.payload.sdp)
        } 
        
        else if (msg.type === 'ice-candidate') {
          // Add candidate, buffering is handled by RTCPeerConnection internally if remoteDesc is set
          try {
             await peerRef.current?.handleIceCandidate(msg.payload.candidate)
          } catch(e) {
             console.warn('ICE candidate error', e)
          }
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
  }, [visitorId, getFileToShare])

  // Step 1: Downloader clicks Intercept
  const requestDownload = async (targetId, file) => {
    setTransferState('waiting_approval')
    setActiveTransferName(`SOLICITANDO: ${file.name}`)
    setProgress(0)
    await signalingRef.current.send(targetId, 'request_download', { fileId: file.id, fileName: file.name })
  }

  // Step 3: Downloader executes WebRTC after approval
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
            setTimeout(() => setTransferState(null), 3000)
         }
      }
    })

    try {
      await peerRef.current.connect()
    } catch (err) {
      console.error('Connection failed:', err)
      setTransferState(null)
    }
  }

  // Uploader Actions
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

  if (isVisitorLoading || isNexusLoading) return <PageLoader />

  const onlinePeers = peers.filter(p => p.is_online)
  const offlinePeers = peers.filter(p => !p.is_online)

  return (
    <PageWrapper className="vhs-scanlines vhs-noise relative">
      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        
        {/* Premium Header */}
        <div className="mb-12 border-b border-accent border-opacity-30 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent opacity-10 blur-3xl rounded-full"></div>
          <div>
            <h1 className="text-5xl font-black font-sans text-text flex items-center gap-4 tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Icon name="device-laptop" className="text-accent text-5xl" size={48} />
              EL NEXO
            </h1>
            <p className="text-muted font-mono mt-3 text-sm tracking-widest max-w-xl">
              SISTEMA DE INTERCAMBIO DE ARCHIVOS P2P. NODO DE TRANSFERENCIA DESCENTRALIZADO EN LA NAVE.
            </p>
          </div>
          <Badge variant="success" className="animate-pulse flex items-center gap-2 px-4 py-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-success">
            <Icon name="broadcast" /> CONEXIÓN ESTABLECIDA
          </Badge>
        </div>

        {/* Toasts */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-bg bg-opacity-90 backdrop-blur-md border border-accent text-text font-mono p-4 rounded shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-4 animate-slide-up">
            <Icon name="check-circle" className="text-accent" />
            <span className="text-sm tracking-wider">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-muted hover:text-text transition-colors">
              <Icon name="close" />
            </button>
          </div>
        )}

        {/* Incoming Request Modal/Banner for Uploader */}
        {incomingRequest && (
          <Card className="mb-10 p-6 border-warning bg-warning bg-opacity-10 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse-slow">
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

        {/* Pings (Alerts for Offline files) */}
        {alerts.length > 0 && (
          <div className="mb-10 space-y-4">
            <h2 className="font-mono text-error font-bold flex items-center gap-2 text-sm tracking-widest">
              <Icon name="alert" /> SEÑALES DE EMERGENCIA ({alerts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map(alert => (
                <Card key={alert.id} className="p-4 border-error bg-error bg-opacity-5 font-mono text-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                  <div className="pl-3">
                    <p className="text-muted mb-2">Terminal <span className="text-error">{alert.sender_id.substring(0, 6).toUpperCase()}</span> necesita:</p>
                    <p className="text-text font-bold truncate">"{alert.file_name}"</p>
                    <p className="text-xs text-muted mt-3 opacity-70">Asegúrate de reactivar el archivo en tu bóveda.</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Transfer Status */}
        {transferState && !incomingRequest && (
          <Card className="mb-10 p-6 border-accent bg-bg bg-opacity-80 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Local Vault */}
          <div className="lg:col-span-5 h-[600px]">
            <NexusLocalVault 
              displayFiles={displayFiles}
              onAddFiles={addFiles}
              onReactivate={reactivateFile}
              onRemove={removeFile}
              hasFileSystemAccess={hasFileSystemAccess}
            />
          </div>

          {/* Right Column: Network Peers */}
          <div className="lg:col-span-7 flex flex-col h-[600px]">
            <h2 className="text-xl font-bold font-sans text-text mb-6 flex items-center gap-3 tracking-wide">
              <Icon name="users" className="text-accent" /> 
              RED DESCENTRALIZADA 
              <Badge className="ml-2 bg-surface text-muted">{onlinePeers.length + offlinePeers.length} NODOS</Badge>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar pb-10">
              {/* Online Peers */}
              {onlinePeers.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-surface text-muted font-mono bg-surface bg-opacity-10 rounded">
                  <Icon name="radar" size={48} className="mx-auto mb-4 opacity-50 animate-pulse-slow" />
                  NO SE DETECTAN TERMINALES ACTIVOS EN TU SECTOR.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {onlinePeers.map(peer => (
                    <NexusTerminalCard 
                      key={peer.visitor_id} 
                      peer={peer} 
                      onDownload={requestDownload}
                      onPing={sendPing}
                    />
                  ))}
                </div>
              )}

              {/* Offline Peers */}
              {offlinePeers.length > 0 && (
                <div className="pt-8 mt-8 border-t border-surface border-opacity-50">
                  <h3 className="text-sm font-bold font-mono text-muted mb-4 flex items-center gap-2">
                    <Icon name="sleep" /> REGISTROS INACTIVOS ({offlinePeers.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {offlinePeers.map(peer => (
                      <NexusTerminalCard 
                        key={peer.visitor_id} 
                        peer={peer} 
                        onDownload={requestDownload}
                        onPing={sendPing}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
