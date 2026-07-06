import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import Icon from '../ui/Icon'
import { Badge } from '../ui/Badge'
import { formatBytes } from '../../utils/formatBytes'

export default function NexusLocalVault({ displayFiles, onAddFiles, onReactivate, onRemove, hasFileSystemAccess }) {
  const activeCount = displayFiles.filter(f => f.isActive).length

  return (
    <Card className="flex flex-col h-full bg-surface bg-opacity-30 backdrop-blur-md border border-accent shadow-lg relative overflow-hidden group">
      
      {/* Decorative scanline inside the card */}
      <div className="absolute inset-0 pointer-events-none opacity-20 vhs-scanlines mix-blend-overlay"></div>

      <div className="p-6 relative z-10 border-b border-accent border-opacity-30 bg-bg bg-opacity-50">
        <h2 className="text-2xl font-black font-sans text-accent tracking-widest flex items-center gap-3 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
          <Icon name="device-laptop" className="animate-pulse" />
          MI BÓVEDA LOCAL
        </h2>
        <div className="font-mono text-sm text-muted mt-2 flex items-center justify-between">
          <span>{displayFiles.length} ARCHIVOS INDEXADOS</span>
          <span className="text-accent">{activeCount} EN LÍNEA</span>
        </div>
        
        <div className="mt-6 flex flex-col gap-3">
          <Button 
            variant="primary" 
            className="w-full justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300 relative overflow-hidden" 
            onClick={onAddFiles}
          >
            <span className="relative z-10 flex items-center gap-2 font-bold tracking-widest">
              <Icon name="folder-plus" /> 
              VINCULAR ARCHIVOS
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </Button>

          {!hasFileSystemAccess && (
            <div className="bg-warning bg-opacity-10 border border-warning text-warning text-xs p-3 rounded font-mono flex items-start gap-2">
              <Icon name="alert" className="flex-shrink-0" />
              <span>TERMINAL NO PERSISTENTE: Las conexiones se perderán al salir de la página debido a políticas de seguridad del navegador.</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-10 space-y-3 bg-bg bg-opacity-40">
        {displayFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted font-mono p-8 text-center opacity-60">
            <Icon name="server" size={64} className="mb-4 text-surface" />
            <p>SISTEMA DE ARCHIVOS VACÍO.</p>
            <p className="text-xs mt-2">VINCULA ARCHIVOS PARA COMENZAR A COMPARTIR CON LA NAVE.</p>
          </div>
        ) : (
          displayFiles.map(file => (
            <div 
              key={file.id} 
              className={`p-4 rounded border font-mono text-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                file.isActive 
                  ? 'bg-accent bg-opacity-5 border-accent border-opacity-50' 
                  : 'bg-surface bg-opacity-20 border-surface border-opacity-50 opacity-70'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon 
                    name={file.isActive ? 'radio-signal' : 'sleep'} 
                    className={file.isActive ? 'text-accent animate-pulse' : 'text-muted'} 
                  />
                  <div className="font-bold text-text truncate max-w-full" title={file.name}>
                    {file.name}
                  </div>
                </div>
                <div className="text-xs text-muted flex items-center gap-3">
                  <span>{formatBytes(file.size)}</span>
                  {file.isEphemeral && <Badge variant="warning" size="sm">MEMORIA RAM</Badge>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                {!file.isActive && !file.isEphemeral && (
                  <Button variant="outline" size="sm" onClick={() => onReactivate(file.id)}>
                    <Icon name="power" /> REACTIVAR
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-error hover:bg-error hover:bg-opacity-10 hover:text-error" onClick={() => onRemove(file.id)}>
                  <Icon name="trash" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
