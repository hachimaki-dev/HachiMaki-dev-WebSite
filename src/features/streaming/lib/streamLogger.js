/**
 * streamLogger.js — Centralized logger for the streaming module
 *
 * Prefixes all messages with [STREAM] for easy filtering.
 * In production, only warn and error are shown.
 */

const IS_DEV = import.meta.env.DEV

/**
 * Create a scoped logger with optional context
 * @param {string} [scope] - Sub-scope like 'signaling', 'peer', 'media'
 * @returns {{ debug: function, info: function, warn: function, error: function }}
 */
export function createStreamLogger(scope = '') {
  const prefix = scope ? `[STREAM:${scope}]` : '[STREAM]'

  return {
    debug(...args) {
      if (IS_DEV) console.debug(prefix, ...args)
    },
    info(...args) {
      if (IS_DEV) console.info(prefix, ...args)
    },
    warn(...args) {
      console.warn(prefix, ...args)
    },
    error(...args) {
      console.error(prefix, ...args)
    },
  }
}

/** Default logger instance */
export const streamLog = createStreamLogger()
