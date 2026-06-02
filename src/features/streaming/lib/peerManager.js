/**
 * peerManager.js — WebRTC peer connections manager (caster side)
 *
 * The caster maintains one RTCPeerConnection per viewer.
 * Each connection receives the caster's local media tracks.
 */

import { createStreamLogger } from './streamLogger'

const log = createStreamLogger('peerManager')

/** ICE server configuration (Free STUN + OpenRelay TURN) */
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
}

/**
 * Create a peer manager for the caster
 * @param {Object} options
 * @param {MediaStream} options.localStream - The caster's media stream
 * @param {function(string, RTCSessionDescriptionInit): void} options.onOffer - Called with (viewerId, offer)
 * @param {function(string, RTCIceCandidate): void} options.onIceCandidate - Called with (viewerId, candidate)
 * @param {function(string): void} [options.onViewerConnected] - Called when a viewer connects
 * @param {function(string): void} [options.onViewerDisconnected] - Called when a viewer disconnects
 * @param {function(string, Error): void} [options.onError] - Called on error
 * @returns {Object} Peer manager interface
 */
export function createPeerManager({
  localStream,
  onOffer,
  onIceCandidate,
  onViewerConnected,
  onViewerDisconnected,
  onError,
}) {
  /** @type {Map<string, RTCPeerConnection>} */
  const peers = new Map()
  /** @type {Map<string, RTCIceCandidateInit[]>} */
  const iceQueues = new Map()

  /**
   * Create a new peer connection for a viewer
   * @param {string} viewerId
   * @returns {Promise<void>}
   */
  async function createPeerForViewer(viewerId) {
    if (peers.has(viewerId)) {
      log.warn(`Peer already exists for viewer ${viewerId}, replacing`)
      removePeer(viewerId)
    }

    const pc = new RTCPeerConnection(ICE_CONFIG)
    peers.set(viewerId, pc)
    iceQueues.set(viewerId, [])

    /* Add all local tracks to the connection */
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    /* ICE candidate handler */
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(viewerId, event.candidate)
      }
    }

    /* Connection state monitoring */
    pc.onconnectionstatechange = () => {
      log.info(`Peer ${viewerId}: connectionState = ${pc.connectionState}`)

      switch (pc.connectionState) {
        case 'connected':
          onViewerConnected?.(viewerId)
          break
        case 'disconnected':
        case 'failed':
          onViewerDisconnected?.(viewerId)
          break
        case 'closed':
          peers.delete(viewerId)
          iceQueues.delete(viewerId)
          break
      }
    }

    pc.oniceconnectionstatechange = () => {
      log.debug(`Peer ${viewerId}: iceConnectionState = ${pc.iceConnectionState}`)

      if (pc.iceConnectionState === 'failed') {
        log.warn(`ICE failed for viewer ${viewerId}, attempting restart`)
        pc.restartIce()
      }
    }

    /* Create and send offer */
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      onOffer(viewerId, pc.localDescription)
      log.info(`Created offer for viewer ${viewerId}`)
    } catch (err) {
      log.error(`Failed to create offer for ${viewerId}:`, err)
      onError?.(viewerId, err)
    }
  }

  /**
   * Handle an SDP answer from a viewer
   * @param {string} viewerId
   * @param {RTCSessionDescriptionInit} sdp
   */
  async function handleAnswer(viewerId, sdp) {
    const pc = peers.get(viewerId)
    if (!pc) {
      log.warn(`No peer found for viewer ${viewerId} when handling answer`)
      return
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      log.info(`Set remote description (answer) for viewer ${viewerId}`)
      
      /* Process queued ICE candidates */
      const queue = iceQueues.get(viewerId) || []
      while (queue.length > 0) {
        const candidate = queue.shift()
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => 
          log.error(`Failed to add queued ICE candidate for ${viewerId}:`, err)
        )
      }
    } catch (err) {
      log.error(`Failed to set answer for ${viewerId}:`, err)
      onError?.(viewerId, err)
    }
  }

  /**
   * Handle an ICE candidate from a viewer
   * @param {string} viewerId
   * @param {RTCIceCandidateInit} candidate
   */
  async function handleIceCandidate(viewerId, candidate) {
    const pc = peers.get(viewerId)
    if (!pc) {
      log.warn(`No peer found for viewer ${viewerId} when handling ICE`)
      return
    }

    if (!pc.remoteDescription) {
      log.debug(`Queueing ICE candidate for ${viewerId} (no remote description yet)`)
      const queue = iceQueues.get(viewerId) || []
      queue.push(candidate)
      iceQueues.set(viewerId, queue)
      return
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      log.debug(`Added ICE candidate for viewer ${viewerId}`)
    } catch (err) {
      log.error(`Failed to add ICE candidate for ${viewerId}:`, err)
    }
  }

  /**
   * Remove and close a specific peer connection
   * @param {string} viewerId
   */
  function removePeer(viewerId) {
    const pc = peers.get(viewerId)
    if (pc) {
      pc.close()
      peers.delete(viewerId)
      log.info(`Removed peer for viewer ${viewerId}`)
    }
  }

  /** Close all peer connections */
  function removeAllPeers() {
    for (const [viewerId, pc] of peers) {
      pc.close()
      log.debug(`Closed peer for viewer ${viewerId}`)
    }
    peers.clear()
    log.info(`Removed all ${peers.size} peers`)
  }

  /** Get count of active peers */
  function getPeerCount() {
    return peers.size
  }

  /**
   * Get connection stats for a specific viewer
   * @param {string} viewerId
   * @returns {Promise<RTCStatsReport|null>}
   */
  async function getStats(viewerId) {
    const pc = peers.get(viewerId)
    if (!pc) return null
    return pc.getStats()
  }

  return {
    createPeerForViewer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    removeAllPeers,
    getPeerCount,
    getStats,
  }
}
