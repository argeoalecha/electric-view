import { createClient } from '@supabase/supabase-js'

interface SupabaseConfig {
  url: string
  anonKey: string
}

// Get Supabase configuration from localStorage or environment
function getSupabaseConfig(): SupabaseConfig | null {
  // Try to get from localStorage first (user-provided config)
  if (typeof window !== 'undefined') {
    try {
      const storedConfig = localStorage.getItem('supabase_config')
      if (storedConfig) {
        const config = JSON.parse(storedConfig)
        if (config.url && config.anonKey) {
          return config
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored Supabase config:', error)
    }
  }

  // Fallback to environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey && envUrl.includes('supabase.co') && envKey.startsWith('eyJ')) {
    return {
      url: envUrl,
      anonKey: envKey
    }
  }

  return null
}

// Create Supabase client with flexible configuration
export function createFlexibleSupabaseClient() {
  const config = getSupabaseConfig()
  
  if (!config) {
    // Return a mock client for demo mode
    return createMockSupabaseClient()
  }

  try {
    return createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return createMockSupabaseClient()
  }
}

// Mock Supabase client for demo mode
function createMockSupabaseClient() {
  const mockUser = {
    id: 'demo-user-id',
    email: 'demo@democrm.ph',
    user_metadata: {
      full_name: 'Demo User',
      company: 'Demo Company',
      region: 'Metro Manila'
    },
    aud: 'authenticated',
    role: 'authenticated'
  }

  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === 'demo@democrm.ph' && password === 'demo123') {
          return {
            data: { user: mockUser, session: { access_token: 'demo-token', user: mockUser } },
            error: null
          }
        }
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid demo credentials. Use demo@democrm.ph / demo123' }
        }
      },
      signUp: async ({ email, password, options }: any) => {
        return {
          data: { user: mockUser, session: { access_token: 'demo-token', user: mockUser } },
          error: null
        }
      },
      signOut: async () => {
        return { error: null }
      },
      getSession: async () => {
        return {
          data: { session: { access_token: 'demo-token', user: mockUser } },
          error: null
        }
      },
      getUser: async () => {
        return {
          data: { user: mockUser },
          error: null
        }
      },
      onAuthStateChange: (callback: any) => {
        // Simulate immediate auth state
        setTimeout(() => {
          callback('SIGNED_IN', { access_token: 'demo-token', user: mockUser })
        }, 100)
        
        return {
          data: { subscription: { unsubscribe: () => {} } }
        }
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: null
        }),
        data: [],
        error: null
      }),
      insert: (data: any) => ({
        data: [data],
        error: null
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          data: [data],
          error: null
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: null
        })
      })
    })
  }
}

// Check if we have a valid Supabase configuration
export function hasValidSupabaseConfig(): boolean {
  const config = getSupabaseConfig()
  return config !== null
}

// Get current configuration status
export function getConfigStatus(): {
  hasConfig: boolean
  isDemo: boolean
  source: 'localStorage' | 'environment' | 'none'
} {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    try {
      const storedConfig = localStorage.getItem('supabase_config')
      if (storedConfig) {
        const config = JSON.parse(storedConfig)
        if (config.url && config.anonKey) {
          return {
            hasConfig: true,
            isDemo: false,
            source: 'localStorage'
          }
        }
      }
    } catch (error) {
      // Continue to environment check
    }
  }

  // Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey && envUrl.includes('supabase.co') && envKey.startsWith('eyJ')) {
    return {
      hasConfig: true,
      isDemo: false,
      source: 'environment'
    }
  }

  return {
    hasConfig: false,
    isDemo: true,
    source: 'none'
  }
}

// Remove stored configuration (logout/reset)
export function clearStoredConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_config')
  }
}