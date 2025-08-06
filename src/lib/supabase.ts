import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'electric-v0.1.2'
    }
  }
})

// Philippine business context utilities
export const philippineConfig = {
  currency: 'PHP',
  timezone: 'Asia/Manila',
  locale: 'en-PH',
  regions: [
    'Metro Manila',
    'Calabarzon',
    'Central Luzon',
    'Central Visayas',
    'Western Visayas',
    'Northern Mindanao',
    'Davao Region',
    'Ilocos Region',
    'Cagayan Valley',
    'Bicol Region',
    'Eastern Visayas',
    'Zamboanga Peninsula',
    'SOCCSKSARGEN',
    'Caraga',
    'MIMAROPA',
    'CAR',
    'BARMM'
  ],
  relationshipLevels: {
    baguhan: 'New Contact',
    kilala: 'Known Contact', 
    malapit: 'Close Relationship',
    kasama: 'Inner Circle'
  },
  trustLevels: {
    establishing: 'Building Trust',
    developing: 'Growing Trust',
    strong: 'Strong Trust',
    deep: 'Deep Trust'
  }
} as const