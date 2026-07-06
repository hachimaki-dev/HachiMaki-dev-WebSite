import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import Icon from '../ui/Icon'
import { Badge } from '../ui/Badge'
import { formatBytes } from '../../utils/formatBytes'

export default function NexusTerminalCard({ peer, onDownload, onPing }) {
  const isOnline = peer.is_online
  const files = peer.files || []

  return (
    <Card className="flex flex-col h-full bg-bg bg-opacity-80 backdrop-blur-md border border-surface shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)] group relative overflow-hidden">
      
      {/* Decorative top bar */}
      <div className={`h-1 w-full absolute top-0 left-0 ${isOnline ? 'bg-success' : 'bg-muted'} opacity-50`}></div>
      
      {/* Hover scanning line */}
      <div className="absolute left-0 right-0 h-[2px] bg-accent opacity-0 group-hover:opacity-50 group-hover:animate-scanline pointer-events-none z-0"></div>

      <div className="p-4 border-b border-surface flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 font-mono font-bold text-lg mb-1">
            <Icon name="monitor" className={isOnline ? 'text-success' : 'text-muted'} />
            <span className={isOnline ? 'text-text' : 'text-muted opacity-80'}>
              TERMINAL_{peer.visitor_id.substring(0, 6).toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted font-mono flex items-center gap-1">
            <Icon name="clock" size={14} /> 
            ÚLTIMA CONEXIÓN: {new Date(peer.last_seen).toLocaleString()}
          </p>
        </div>
        <Badge variant={isOnline ? 'success' : 'default'} className="font-mono text-[10px] tracking-wider px-2 py-0.5 shadow-none">
          {isOnline ? 'EN LÍNEA' : 'FUERA DE LÍNEA'}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col relative z-10 bg-surface bg-opacity-5">
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted font-mono opacity-50 py-4">
            <Icon name="folder-off" size={32} className="mb-2" />
            <p className="text-sm">NO HAY ARCHIVOS INDEXADOS</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="flex flex-col gap-2 p-3 bg-bg rounded border border-surface border-opacity-50 hover:border-accent hover:border-opacity-30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="font-mono font-bold text-sm text-text truncate pr-2 flex-1" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-muted font-mono whitespace-nowrap shrink-0 opacity-80">
                    {formatBytes(file.size)}
                  </div>
                </div>
                
                <div className="flex justify-end mt-1">
                  {isOnline ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDownload(peer.visitor_id, file)}
                      className="text-accent hover:bg-accent hover:bg-opacity-10 py-1 px-3 text-xs tracking-widest font-bold"
                    >
                      <Icon name="download" size={14} /> INTERCEPTAR
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onPing(peer.visitor_id, file.id, file.name)}
                      className="text-warning hover:bg-warning hover:bg-opacity-10 py-1 px-3 text-xs tracking-widest font-bold"
                    >
                      <Icon name="notification" size={14} /> TRANSMITIR ALERTA
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
