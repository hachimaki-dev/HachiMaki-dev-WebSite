/**
 * nexusSignaling.js
 * Supabase Realtime wrapper for P2P connection negotiation
 */
import { supabase } from '../../../lib/supabase'

export function createNexusSignaling(visitorId, onMessage) {
  let subscription = null

  async function subscribe() {
    subscription = supabase.channel(`nexus_signaling_${visitorId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'p2p_signaling', 
          filter: `target_id=eq.${visitorId}` 
        },
        (payload) => {
          onMessage?.(payload.new)
        }
      )
      .subscribe()
  }

  async function send(targetId, type, payload) {
    const { error } = await supabase.from('p2p_signaling').insert({
      sender_id: visitorId,
      target_id: targetId,
      type,
      payload
    })
    if (error) {
      console.error('Signaling send error:', error)
      throw error
    }
  }

  function unsubscribe() {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }
  }

  return { subscribe, send, unsubscribe }
}
