import { useRef, useState, useEffect } from 'react'
import { useChat } from '../../../features/streaming/hooks/useChat'
import { StreamChat } from './StreamChat'
import { formatDate } from '../../../utils/formatDate'
import Icon from '../../../components/ui/Icon'
import './ViewerPage.css'

function formatVideoTime(timeInSeconds) {
  if (isNaN(timeInSeconds)) return '00:00'
  const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0')
  const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function VodViewer({ url, title, roomId, createdAt, onClose }) {
  // Use a pseudo-viewer ID for VOD so we don't interfere with real-time presence
  const { messages } = useChat(roomId, 'vod-viewer', 'VOD Viewer')

  const videoRef = useRef(null)
  const wrapperRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  
  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false)
      }, 3000)
    }
    
    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.addEventListener('mousemove', handleMouseMove)
      wrapper.addEventListener('mouseleave', () => { if (isPlaying) setShowControls(false) })
    }
    
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mousemove', handleMouseMove)
        wrapper.removeEventListener('mouseleave', () => {})
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.().catch(console.error)
    } else {
      document.exitFullscreen?.().catch(console.error)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleScrubberChange = (e) => {
    const newTime = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setProgress(newTime)
    }
  }

  return (
    <div className="viewer-page">
      <div className="viewer-page__main">
        {/* Top bar */}
        <div className="viewer-page__topbar">
          <h1 className="viewer-page__title">
            {title || 'VOD Recording'}
          </h1>
          <div className="viewer-page__badges">
            <span className="viewer-page__stat viewer-page__stat--viewers">
              <Icon name="video" /> VOD {createdAt ? `- ${formatDate(createdAt).toUpperCase()}` : ''}
            </span>
            {onClose && (
               <button className="viewer-page__close-btn" onClick={onClose} title="Cerrar reproductor">
                 <Icon name="close" />
               </button>
            )}
          </div>
        </div>

        {/* Video area */}
        <div className="viewer-page__video-area" style={{ padding: 0 }}>
          <div 
            className={`viewer-page__video-wrapper ${!showControls ? 'viewer-page__video-wrapper--hide-cursor' : ''}`} 
            ref={wrapperRef}
          >
            <video
              ref={videoRef}
              className="viewer-page__video"
              autoPlay
              playsInline
              src={url}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Custom Controls */}
            <div className={`vod-controls ${showControls || !isPlaying ? 'vod-controls--visible' : ''}`}>
              <button className="vod-controls__btn vod-controls__btn--play" onClick={togglePlay}>
                <Icon name={isPlaying ? 'pause' : 'play'} />
              </button>
              
              <div className="vod-controls__time">
                {formatVideoTime(progress)} / {formatVideoTime(duration)}
              </div>
              
              <div className="vod-controls__scrubber-wrapper">
                <input 
                  type="range" 
                  className="vod-controls__scrubber"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleScrubberChange}
                />
                <div 
                  className="vod-controls__scrubber-progress" 
                  style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                ></div>
              </div>
              
              <button className="vod-controls__btn" onClick={toggleMute}>
                <Icon name={isMuted ? 'volume-x' : 'volume'} />
              </button>
              
              <button className="vod-controls__btn" onClick={toggleFullscreen}>
                <Icon name="expand" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="viewer-page__sidebar">
        <StreamChat
          messages={messages}
          readOnly={true}
        />
      </div>
    </div>
  )
}
