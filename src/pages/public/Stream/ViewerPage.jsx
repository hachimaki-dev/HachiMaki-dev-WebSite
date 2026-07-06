/**
 * ViewerPage.jsx — Stream viewer (spectator) page
 *
 * Uses the StreamViewer component to render the stream and chat.
 */

import { useParams } from 'react-router-dom'
import { StreamViewer } from './StreamViewer'

export function ViewerPage() {
  const { slug } = useParams()

  return <StreamViewer slug={slug} />
}
