'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { createFlexibleSupabaseClient, getConfigStatus } from '@/lib/supabase-flexible'

interface SupabaseContextType {
  supabase: any // Using any for flexibility with mock client
  user: User | null
  loading: boolean
  isDemo: boolean
  hasValidConfig: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createFlexibleSupabaseClient())
  const [configStatus] = useState(() => getConfigStatus())
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user as any ?? null)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ 
      supabase, 
      user, 
      loading, 
      isDemo: configStatus.isDemo,
      hasValidConfig: configStatus.hasConfig 
    }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}