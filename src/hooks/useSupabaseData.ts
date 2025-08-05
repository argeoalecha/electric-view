'use client'

import { useState, useEffect } from 'react'
import { createFlexibleSupabaseClient, hasValidSupabaseConfig } from '@/lib/supabase-flexible'

// Company interface matching our database schema
export interface Company {
  id: string
  name: string
  industry: string | null
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
  business_type: 'sole_proprietorship' | 'partnership' | 'corporation' | 'cooperative' | null
  address: string | null
  city: string | null
  region: string | null
  website: string | null
  phone: string | null
  email: string | null
  tin: string | null
  employee_count: number | null
  annual_revenue: number | null
  description: string | null
  established_year: number | null
  status: 'prospect' | 'client' | 'partner' | 'inactive'
  created_at: string
  updated_at: string
}

// Contact interface matching our database schema
export interface Contact {
  id: string
  company_id: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  preferred_name: string | null
  email: string | null
  phone: string | null
  mobile_number: string | null
  job_title: string | null
  source: string | null
  relationship_level: 'baguhan' | 'kilala' | 'malapit' | 'kasama'
  is_decision_maker: boolean
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  // Joined data from company
  company?: {
    name: string
    industry: string | null
  }
}

// Deal interface matching our database schema
export interface Deal {
  id: string
  contact_id: string | null
  company_id: string | null
  title: string
  value_php: number | null
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close_date: string | null
  relationship_strength: 'developing' | 'good' | 'strong' | 'excellent'
  lead_source: string | null
  notes: string | null
  next_action: string | null
  next_action_date: string | null
  created_at: string
  updated_at: string
  // Joined data
  contact?: {
    first_name: string
    last_name: string
    email: string | null
  }
  company?: {
    name: string
    industry: string | null
  }
}

// Mock data for demo mode (fallback when no real database)
const mockCompanies: Company[] = [
  {
    id: 'comp-001',
    name: 'Ayala Land Inc.',
    industry: 'Real Estate',
    size: 'enterprise',
    business_type: 'corporation',
    address: '6750 Ayala Avenue, Makati CBD',
    city: 'Makati',
    region: 'Metro Manila',
    website: 'www.ayalaland.com.ph',
    phone: '(02) 8845-1234',
    email: 'info@ayalaland.com.ph',
    tin: '000-123-456-000',
    employee_count: 8000,
    annual_revenue: 50000000000,
    description: 'Premier real estate developer in the Philippines',
    established_year: 1988,
    status: 'client',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'comp-002',
    name: 'SM Retail Group',
    industry: 'Retail',
    size: 'enterprise',
    business_type: 'corporation',
    address: 'Mall of Asia Complex, Pasay City',
    city: 'Pasay',
    region: 'Metro Manila',
    website: 'www.sminvestments.com',
    phone: '(02) 8123-4567',
    email: 'corporate@sm.com.ph',
    tin: '000-789-123-000',
    employee_count: 15000,
    annual_revenue: 25000000000,
    description: 'Leading retail and mall operator in the Philippines',
    established_year: 1958,
    status: 'client',
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: 'comp-003',
    name: 'TechStart Manila',
    industry: 'Technology',
    size: 'small',
    business_type: 'corporation',
    address: '123 BGC Central, Bonifacio Global City',
    city: 'Taguig',
    region: 'Metro Manila',
    website: 'www.techstartmla.ph',
    phone: '(02) 8555-0123',
    email: 'hello@techstartmla.ph',
    tin: null,
    employee_count: 45,
    annual_revenue: 15000000,
    description: 'Growing tech startup focusing on fintech solutions',
    established_year: 2020,
    status: 'prospect',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-14T00:00:00Z'
  }
]

const mockContacts: Contact[] = [
  {
    id: 'contact-001',
    company_id: 'comp-001',
    first_name: 'Maria Carmen',
    middle_name: null,
    last_name: 'Santos',
    preferred_name: 'Carmen',
    email: 'maria.santos@ayalaland.com.ph',
    phone: null,
    mobile_number: '+639171234567',
    job_title: 'VP Business Development',
    source: 'referral',
    relationship_level: 'malapit',
    is_decision_maker: true,
    notes: 'High-value enterprise client. Prefers face-to-face meetings.',
    tags: ['enterprise', 'real-estate', 'decision-maker'],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    company: { name: 'Ayala Land Inc.', industry: 'Real Estate' }
  },
  {
    id: 'contact-002',
    company_id: 'comp-002',
    first_name: 'Jose Miguel',
    middle_name: null,
    last_name: 'Reyes',
    preferred_name: 'Miguel',
    email: 'jose.reyes@sm.com.ph',
    phone: null,
    mobile_number: '+639287654321',
    job_title: 'Regional Manager',
    source: 'cold_outreach',
    relationship_level: 'kilala',
    is_decision_maker: true,
    notes: 'Interested in tech solutions for retail operations.',
    tags: ['retail', 'operations', 'decision-maker'],
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z',
    company: { name: 'SM Retail Group', industry: 'Retail' }
  },
  {
    id: 'contact-003',
    company_id: 'comp-003',
    first_name: 'Anna Marie',
    middle_name: null,
    last_name: 'Cruz',
    preferred_name: 'Anna',
    email: 'anna.cruz@techstartmnl.ph',
    phone: null,
    mobile_number: '+639456789012',
    job_title: 'Chief Technology Officer',
    source: 'networking',
    relationship_level: 'baguhan',
    is_decision_maker: true,
    notes: 'Early-stage startup, budget conscious but growth-focused.',
    tags: ['startup', 'technology', 'fintech'],
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-14T00:00:00Z',
    company: { name: 'TechStart Manila', industry: 'Technology' }
  }
]

const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    contact_id: 'contact-001',
    company_id: 'comp-001',
    title: 'Ayala Land CRM Implementation',
    value_php: 2500000,
    stage: 'proposal',
    probability: 75,
    expected_close_date: '2024-09-15',
    relationship_strength: 'strong',
    lead_source: 'referral',
    notes: 'Enterprise CRM solution for property management',
    next_action: 'Present final proposal',
    next_action_date: '2024-02-15',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    contact: { first_name: 'Maria Carmen', last_name: 'Santos', email: 'maria.santos@ayalaland.com.ph' },
    company: { name: 'Ayala Land Inc.', industry: 'Real Estate' }
  },
  {
    id: 'deal-002',
    contact_id: 'contact-002',
    company_id: 'comp-002',
    title: 'SM Retail POS Integration',
    value_php: 5000000,
    stage: 'negotiation',
    probability: 85,
    expected_close_date: '2024-08-30',
    relationship_strength: 'excellent',
    lead_source: 'inbound',
    notes: 'Point-of-sale system integration across multiple locations',
    next_action: 'Finalize contract terms',
    next_action_date: '2024-02-10',
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z',
    contact: { first_name: 'Jose Miguel', last_name: 'Reyes', email: 'jose.reyes@sm.com.ph' },
    company: { name: 'SM Retail Group', industry: 'Retail' }
  },
  {
    id: 'deal-003',
    contact_id: 'contact-003',
    company_id: 'comp-003',
    title: 'TechStart Fintech Platform',
    value_php: 750000,
    stage: 'qualified',
    probability: 45,
    expected_close_date: '2024-10-01',
    relationship_strength: 'developing',
    lead_source: 'networking',
    notes: 'Custom fintech platform development',
    next_action: 'Schedule technical requirements meeting',
    next_action_date: '2024-02-20',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-14T00:00:00Z',
    contact: { first_name: 'Anna Marie', last_name: 'Cruz', email: 'anna.cruz@techstartmnl.ph' },
    company: { name: 'TechStart Manila', industry: 'Technology' }
  }
]

// Hook to fetch companies
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true)
        
        if (!hasValidSupabaseConfig()) {
          // Use mock data in demo mode
          setCompanies(mockCompanies)
          setLoading(false)
          return
        }

        const supabase = createFlexibleSupabaseClient()
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setCompanies(data || [])
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch companies')
        // Fallback to mock data on error
        setCompanies(mockCompanies)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return { companies, loading, error, refetch: () => window.location.reload() }
}

// Hook to fetch contacts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true)
        
        if (!hasValidSupabaseConfig()) {
          // Use mock data in demo mode
          setContacts(mockContacts)
          setLoading(false)
          return
        }

        const supabase = createFlexibleSupabaseClient()
        const { data, error } = await supabase
          .from('contacts')
          .select(`
            *,
            company:companies(name, industry)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setContacts(data || [])
      } catch (err) {
        console.error('Error fetching contacts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
        // Fallback to mock data on error
        setContacts(mockContacts)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  return { contacts, loading, error, refetch: () => window.location.reload() }
}

// Hook to fetch deals
export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true)
        
        if (!hasValidSupabaseConfig()) {
          // Use mock data in demo mode
          setDeals(mockDeals)
          setLoading(false)
          return
        }

        const supabase = createFlexibleSupabaseClient()
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            contact:contacts(first_name, last_name, email),
            company:companies(name, industry)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setDeals(data || [])
      } catch (err) {
        console.error('Error fetching deals:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch deals')
        // Fallback to mock data on error
        setDeals(mockDeals)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  return { deals, loading, error, refetch: () => window.location.reload() }
}