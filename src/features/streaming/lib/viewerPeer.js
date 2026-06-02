/**
 * viewerPeer.js — WebRTC peer connection (viewer side)
 *
 * The viewer maintains a single RTCPeerConnection to the caster.
 * Handles offer reception, answer creation, ICE exchange,
 * and automatic reconnection with exponential backoff.
 */

import { createStreamLogger } from './streamLogger'

const log = createStreamLogger('viewerPeer')

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

/** Reconnection backoff configuration */
const BACKOFF = {
  INITIAL_MS: 1000,
  MAX_MS: 30000,
  MULTIPLIER: 2,
}

/**
 * Create a viewer peer connection
 * @param {Object} options
 * @param {function(RTCSessionDescriptionInit): void} options.onAnswer - Called with SDP answer to send
 * @param {function(RTCIceCandidate): void} options.onIceCandidate - Called with ICE candidate to send
 * @param {function(MediaStream): void} options.onTrack - Called when remote track is received
 * @param {function('connecting'|'connected'|'reconnecting'|'disconnected'|'failed'): void} [options.onStateChange]
 * @param {function(): void} [options.onReconnecting] - Called when attempting reconnection
 * @param {function(Error): void} [options.onError]
 * @returns {Object} Viewer peer interface
 */
export function createViewerPeer({
  onAnswer,
  onIceCandidate,
  onTrack,
  onStateChange,
  onReconnecting,
  onError,
}) {
  /** @type {RTCPeerConnection|null} */
  let pc = null
  let reconnectTimeout = null
  let backoffMs = BACKOFF.INITIAL_MS
  let isDestroyed = false

  /** @type {RTCIceCandidateInit[]} */
  let iceQueue = []

  /**
   * Handle an SDP offer from the caster
   * @param {RTCSessionDescriptionInit} sdp
   */
  async function handleOffer(sdp) {
    /* Clean up existing connection if any */
    if (pc) {
      pc.close()
      pc = null
    }

    pc = new RTCPeerConnection(ICE_CONFIG)

    /* ICE candidate handler */
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate)
      }
    }

    /* Track handler — delivers remote media stream */
    pc.ontrack = (event) => {
      log.info('Received remote track:', event.track.kind)
      if (event.streams?.[0]) {
        onTrack(event.streams[0])
      }
    }

    /* Connection state monitoring */
    pc.onconnectionstatechange = () => {
      const state = pc?.connectionState
      log.info('connectionState:', state)

      switch (state) {
        case 'connected':
          backoffMs = BACKOFF.INITIAL_MS
          onStateChange?.('connected')
          break
        case 'disconnected':
          onStateChange?.('reconnecting')
          onReconnecting?.()
          scheduleReconnect()
          break
        case 'failed':
          onStateChange?.('failed')
          log.warn('Connection failed, attempting ICE restart')
          pc?.restartIce()
          break
        case 'closed':
          onStateChange?.('disconnected')
          break
      }
    }

    pc.oniceconnectionstatechange = () => {
      log.debug('iceConnectionState:', pc?.iceConnectionState)
    }

    /* Apply offer and create answer */
    try {
      onStateChange?.('connecting')
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      
      /* Process queued ICE candidates */
      while (iceQueue.length > 0) {
        const candidate = iceQueue.shift()
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => 
          log.error('Failed to add queued ICE candidate:', err)
        )
      }

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      onAnswer(pc.localDescription)
      log.info('Created and sent answer')
    } catch (err) {
      log.error('Failed to handle offer:', err)
      onError?.(err)
    }
  }

  /**
   * Handle an ICE candidate from the caster
   * @param {RTCIceCandidateInit} candidate
   */
  async function handleIceCandidate(candidate) {
    if (!pc) {
      log.warn('No peer connection when handling ICE candidate, queueing')
      iceQueue.push(candidate)
      return
    }

    if (!pc.remoteDescription) {
      log.debug('Queueing ICE candidate (no remote description yet)')
      iceQueue.push(candidate)
      return
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      log.debug('Added ICE candidate from caster')
    } catch (err) {
      log.error('Failed to add ICE candidate:', err)
    }
  }

  /** Schedule a reconnection attempt with exponential backoff */
  function scheduleReconnect() {
    if (isDestroyed) return

    clearTimeout(reconnectTimeout)
    log.info(`Scheduling reconnect in ${backoffMs}ms`)

    reconnectTimeout = setTimeout(() => {
      if (!isDestroyed && pc?.connectionState !== 'connected') {
        log.info('Attempting ICE restart for reconnection')
        pc?.restartIce()
        backoffMs = Math.min(backoffMs * BACKOFF.MULTIPLIER, BACKOFF.MAX_MS)
      }
    }, backoffMs)
  }

  /** Disconnect and clean up */
  function disconnect() {
    isDestroyed = true
    clearTimeout(reconnectTimeout)

    if (pc) {
      pc.close()
      pc = null
    }

    log.info('Viewer peer disconnected')
  }

  /** Get current connection state */
  function getState() {
    return pc?.connectionState ?? 'closed'
  }

  /**
   * Get connection stats
   * @returns {Promise<RTCStatsReport|null>}
   */
  async function getStats() {
    if (!pc) return null
    return pc.getStats()
  }

  return {
    handleOffer,
    handleIceCandidate,
    disconnect,
    getState,
    getStats,
  }
}
