import { useState } from 'react'
import { usePublicLiveStreams } from '../../../features/streaming/hooks/usePublicLiveStreams'
import { StreamPlayerModal } from './StreamPlayerModal'
import Icon from '../../../components/ui/Icon'
import './StreamStories.css'

export function StreamStories({ className = '' }) {
  const { stories, loading: streamsLoading } = usePublicLiveStreams()
  const [activeStream, setActiveStream] = useState(null)

  if (streamsLoading || !stories || stories.length === 0) {
    return null
  }

  return (
    <>
      <div className={`stream-stories-list ${className}`.trim()}>
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActiveStream(
              story.type === 'live' 
                ? { slug: story.slug } 
                : { vodUrl: story.link, title: story.title, roomId: story.roomId, createdAt: story.createdAt }
            )}
            className={`stream-story stream-story--${story.type}`}
          >
            <div className="stream-story-ring">
              <div className="stream-story-avatar-wrap">
                <img src={story.avatar} alt="Avatar" className="stream-story-avatar" />
                {story.type === 'vod' && (
                  <div className="stream-story-vod-icon"><Icon name="play" /></div>
                )}
                <div className="vhs-case__worn-edges"></div>
              </div>
            </div>
            <span className="stream-story-title">{story.title}</span>
          </button>
        ))}
      </div>

      {activeStream && (
        <StreamPlayerModal
          slug={activeStream.slug}
          vodUrl={activeStream.vodUrl}
          title={activeStream.title}
          roomId={activeStream.roomId}
          createdAt={activeStream.createdAt}
          onClose={() => setActiveStream(null)}
        />
      )}
    </>
  )
}
