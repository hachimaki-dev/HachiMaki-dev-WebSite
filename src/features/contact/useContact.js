import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLES } from '../../lib/constants'

/**
 * useContact — Submit contact messages (public)
 * @returns {{ sendMessage: function, loading: boolean, error: string|null }}
 */
export function useContact() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async ({ name, email, subject, message }) => {
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from(TABLES.CONTACT_MESSAGES)
      .insert([
        {
          name: name || null,
          email,
          subject,
          message,
        },
      ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return { success: false, error: insertError.message }
    }

    return { success: true }
  }, [])

  return { sendMessage, loading, error }
}
