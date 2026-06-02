/**
 * signalingCleanup.js — Cleanup old signaling messages
 *
 * Removes stale SDP/ICE messages from the signaling_messages table
 * to prevent data accumulation.
 */

import { supabase } from '../../../lib/supabase'
import { TABLES } from '../../../lib/constants'
import { createStreamLogger } from './streamLogger'

const log = createStreamLogger('cleanup')

/** Default max age in minutes for signaling messages */
const DEFAULT_MAX_AGE_MINUTES = 5

/** Cleanup interval in ms */
const CLEANUP_INTERVAL_MS = 60_000

/**
 * Delete signaling messages older than maxAgeMinutes
 * @param {string} roomId
 * @param {number} [maxAgeMinutes]
 */
export async function cleanupOldMessages(roomId, maxAgeMinutes = DEFAULT_MAX_AGE_MINUTES) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000).toISOString()

  const { error, count } = await supabase
    .from(TABLES.SIGNALING)
    .delete({ count: 'exact' })
    .eq('room_id', roomId)
    .lt('created_at', cutoff)

  if (error) {
    log.warn('Cleanup failed:', error.message)
    return 0
  }

  if (count > 0) {
    log.info(`Cleaned up ${count} old messages for room ${roomId}`)
  }

  return count
}

/**
 * Delete ALL signaling messages for a room (used when stream ends)
 * @param {string} roomId
 */
export async function cleanupAllMessages(roomId) {
  const { error, count } = await supabase
    .from(TABLES.SIGNALING)
    .delete({ count: 'exact' })
    .eq('room_id', roomId)

  if (error) {
    log.warn('Full cleanup failed:', error.message)
    return 0
  }

  log.info(`Cleaned up all ${count} messages for room ${roomId}`)
  return count
}

/**
 * Start periodic cleanup for a room
 * @param {string} roomId
 * @returns {function} stop — call to cancel the interval
 */
export function startPeriodicCleanup(roomId) {
  const intervalId = setInterval(() => {
    cleanupOldMessages(roomId)
  }, CLEANUP_INTERVAL_MS)

  log.info(`Started periodic cleanup for room ${roomId}`)

  return function stop() {
    clearInterval(intervalId)
    log.info(`Stopped periodic cleanup for room ${roomId}`)
  }
}
