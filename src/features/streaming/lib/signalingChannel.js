/**
 * signalingChannel.js — WebRTC signaling over Supabase Realtime
 *
 * Wraps Supabase Realtime subscriptions on the signaling_messages table
 * to exchange SDP offers, answers, and ICE candidates between peers.
 */

import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from './streamLogger'

const log = createStreamLogger('signaling')

/**
 * @typedef {Object} SignalingMessage
 * @property {string} id
 * @property {string} room_id
 * @property {string} sender_id
 * @property {string|null} target_id
 * @property {'offer'|'answer'|'ice-candidate'|'viewer-ready'} type
 * @property {Object} payload
 * @property {string} created_at
 */

/**
 * Create a signaling channel for a room
 * @param {string} roomId - The room UUID
 * @param {string} localId - This peer's identifier
 * @returns {Object} Signaling channel interface
 */
export function createSignalingChannel(roomId, localId) {
  let subscription = null
  let messageCallback = null

  /**
   * Subscribe to signaling messages for this room
   * @param {function(SignalingMessage): void} onMessage - Called for each new message
   * @returns {Promise<void>} Resolves when successfully subscribed
   */
  function subscribe(onMessage) {
    messageCallback = onMessage

    return new Promise((resolve, reject) => {
      subscription = supabase
        .channel(`signaling:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: TABLES.SIGNALING,
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const msg = payload.new
            /* Ignore own messages */
            if (msg.sender_id === localId) return
            /* If targeted, ignore messages not for us */
            if (msg.target_id && msg.target_id !== localId) return

            log.debug('Received:', msg.type, 'from', msg.sender_id)
            messageCallback?.(msg)
          }
        )
        .subscribe((status, err) => {
          log.info('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            resolve()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            log.error('Channel error:', err)
            reject(new Error(`Failed to subscribe: ${status}`))
          }
        })
    })
  }

  /**
   * Send a signaling message
   * @param {'offer'|'answer'|'ice-candidate'|'viewer-ready'} type
   * @param {Object} payload - SDP or ICE candidate data
   * @param {string|null} [targetId] - Target peer ID (null for broadcast)
   */
  async function send(type, payload, targetId = null) {
    const { error } = await supabase.from(TABLES.SIGNALING).insert({
      room_id: roomId,
      sender_id: localId,
      target_id: targetId,
      type,
      payload,
    })

    if (error) {
      log.error('Failed to send signaling message:', error.message)
      throw error
    }

    log.debug('Sent:', type, targetId ? `to ${targetId}` : '(broadcast)')
  }

  /** Send an SDP offer to a specific viewer */
  async function sendOffer(targetId, sdp) {
    return send('offer', { sdp }, targetId)
  }

  /** Send an SDP answer to the caster */
  async function sendAnswer(targetId, sdp) {
    return send('answer', { sdp }, targetId)
  }

  /** Send an ICE candidate to a specific peer */
  async function sendIceCandidate(targetId, candidate) {
    return send('ice-candidate', { candidate }, targetId)
  }

  /** Announce viewer readiness (broadcast) */
  async function sendViewerReady() {
    return send('viewer-ready', { viewerId: localId })
  }

  /** Unsubscribe from the channel */
  function unsubscribe() {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
      log.info('Unsubscribed from signaling channel')
    }
  }

  return {
    subscribe,
    send,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendViewerReady,
    unsubscribe,
  }
}
