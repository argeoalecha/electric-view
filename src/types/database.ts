export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_tier: string
          billing_email: string
          business_type: string
          city: string
          province: string
          currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription_tier?: string
          billing_email: string
          business_type: string
          city: string
          province: string
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription_tier?: string
          billing_email?: string
          business_type?: string
          city?: string
          province?: string
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          position: string | null
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: string
          phone?: string | null
          position?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          position?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          organization_id: string
          name: string
          industry: string | null
          size_category: string | null
          business_type: string | null
          address: string | null
          city: string | null
          province: string | null
          website: string | null
          annual_revenue_php: number | null
          employee_count: number | null
          main_products_services: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          industry?: string | null
          size_category?: string | null
          business_type?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          website?: string | null
          annual_revenue_php?: number | null
          employee_count?: number | null
          main_products_services?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          industry?: string | null
          size_category?: string | null
          business_type?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          website?: string | null
          annual_revenue_php?: number | null
          employee_count?: number | null
          main_products_services?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          company_id: string | null
          first_name: string
          middle_name: string | null
          last_name: string
          preferred_name: string | null
          email: string | null
          mobile_number: string | null
          landline: string | null
          job_title: string | null
          personal_notes: string | null
          birthday: string | null
          is_decision_maker: boolean | null
          preferred_contact_method: string | null
          tags: string[] | null
          social_media: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_id?: string | null
          first_name: string
          middle_name?: string | null
          last_name: string
          preferred_name?: string | null
          email?: string | null
          mobile_number?: string | null
          landline?: string | null
          job_title?: string | null
          personal_notes?: string | null
          birthday?: string | null
          is_decision_maker?: boolean | null
          preferred_contact_method?: string | null
          tags?: string[] | null
          social_media?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_id?: string | null
          first_name?: string
          middle_name?: string | null
          last_name?: string
          preferred_name?: string | null
          email?: string | null
          mobile_number?: string | null
          landline?: string | null
          job_title?: string | null
          personal_notes?: string | null
          birthday?: string | null
          is_decision_maker?: boolean | null
          preferred_contact_method?: string | null
          tags?: string[] | null
          social_media?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          contact_id: string | null
          company_id: string | null
          title: string
          value_php: number
          stage: string
          probability: number
          lead_source: string | null
          expected_close_date: string | null
          relationship_strength: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          urgency_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          contact_id?: string | null
          company_id?: string | null
          title: string
          value_php: number
          stage?: string
          probability?: number
          lead_source?: string | null
          expected_close_date?: string | null
          relationship_strength?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          urgency_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          contact_id?: string | null
          company_id?: string | null
          title?: string
          value_php?: number
          stage?: string
          probability?: number
          lead_source?: string | null
          expected_close_date?: string | null
          relationship_strength?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          urgency_level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          deal_id: string | null
          contact_id: string | null
          created_by: string
          type: string
          description: string
          activity_date: string
          outcome: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          duration_minutes: number | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          deal_id?: string | null
          contact_id?: string | null
          created_by: string
          type: string
          description: string
          activity_date: string
          outcome?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          duration_minutes?: number | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          deal_id?: string | null
          contact_id?: string | null
          created_by?: string
          type?: string
          description?: string
          activity_date?: string
          outcome?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          duration_minutes?: number | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Philippine-specific types
export type PhilippineRegion = 
  | 'Metro Manila'
  | 'Calabarzon'
  | 'Central Luzon'
  | 'Central Visayas'
  | 'Western Visayas'
  | 'Northern Mindanao'
  | 'Davao Region'
  | 'Ilocos Region'
  | 'Cagayan Valley'
  | 'Bicol Region'
  | 'Eastern Visayas'
  | 'Zamboanga Peninsula'
  | 'SOCCSKSARGEN'
  | 'Caraga'
  | 'MIMAROPA'
  | 'CAR'
  | 'BARMM'

export type RelationshipLevel = 'baguhan' | 'kilala' | 'malapit' | 'kasama'
export type TrustLevel = 'establishing' | 'developing' | 'strong' | 'deep'

export interface LeadScore {
  total_score: number
  demographic_score: number
  engagement_score: number
  cultural_score: number
  business_score: number
  grade: 'A' | 'B' | 'C' | 'D'
  cultural_context: string
  next_action_recommendation: string
  calculated_at: string
}