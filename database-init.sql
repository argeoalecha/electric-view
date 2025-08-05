-- Philippine CRM Database Initialization
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('startup', 'small', 'medium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  phone TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Philippine companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  business_type TEXT CHECK (business_type IN ('sole_proprietorship', 'partnership', 'corporation', 'cooperative')),
  tin TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  employee_count INTEGER,
  annual_revenue DECIMAL(15,2),
  description TEXT,
  established_year INTEGER,
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'client', 'partner', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Philippine contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT,
  phone TEXT,
  mobile_number TEXT,
  job_title TEXT,
  source TEXT,
  relationship_level TEXT DEFAULT 'baguhan' CHECK (relationship_level IN ('baguhan', 'kilala', 'malapit', 'kasama')),
  is_decision_maker BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Philippine deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  value_php DECIMAL(15,2),
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  relationship_strength TEXT DEFAULT 'developing' CHECK (relationship_strength IN ('developing', 'good', 'strong', 'excellent')),
  lead_source TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  deal_id UUID REFERENCES deals(id),
  contact_id UUID REFERENCES contacts(id),
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'proposal')),
  description TEXT NOT NULL,
  outcome TEXT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage companies in their organization" ON companies
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage contacts in their organization" ON contacts
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage deals in their organization" ON deals
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage activities in their organization" ON activities
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_organization ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_deals_organization ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_activities_organization ON activities(organization_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Create organization slug from email domain
  org_slug := LOWER(REGEXP_REPLACE(
    COALESCE(
      SPLIT_PART(NEW.email, '@', 2),
      'org-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
    ),
    '[^a-z0-9]', '-', 'g'
  ));

  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 4);
  END LOOP;

  -- Create organization
  INSERT INTO public.organizations (name, slug, created_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company', 'My Organization'),
    org_slug,
    NOW()
  )
  RETURNING id INTO org_id;

  -- Create profile
  INSERT INTO public.profiles (id, organization_id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample Philippine data
INSERT INTO organizations (id, name, slug, description, industry, size, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Philippine CRM', 'demo-crm', 'Sample organization for Philippine CRM', 'Technology', 'small', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample Philippine companies
INSERT INTO companies (id, organization_id, name, industry, size, business_type, address, city, region, phone, email, employee_count, annual_revenue, description, status, created_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Ayala Land Inc.', 'Real Estate', 'enterprise', 'corporation', '6750 Ayala Avenue, Makati CBD', 'Makati', 'Metro Manila', '(02) 8845-1234', 'info@ayalaland.com.ph', 8000, 50000000000, 'Premier real estate developer in the Philippines', 'client', NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'SM Retail Inc.', 'Retail', 'enterprise', 'corporation', 'Mall of Asia Complex, Pasay', 'Pasay', 'Metro Manila', '(02) 8556-0680', 'corporate@sm.com.ph', 12000, 75000000000, 'Leading retail chain in the Philippines', 'client', NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'TechStart Manila', 'Technology', 'small', 'corporation', 'BGC, Taguig City', 'Taguig', 'Metro Manila', '(02) 7789-3456', 'hello@techstartmnl.ph', 45, 15000000, 'Growing tech startup focusing on fintech solutions', 'prospect', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample Philippine contacts
INSERT INTO contacts (id, organization_id, company_id, first_name, last_name, email, mobile_number, job_title, relationship_level, is_decision_maker, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Maria Carmen', 'Santos', 'maria.santos@ayalaland.com.ph', '+639171234567', 'VP Business Development', 'malapit', true, NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 'Jose Miguel', 'Reyes', 'jose.reyes@sm.com.ph', '+639287654321', 'Regional Manager', 'kilala', true, NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', 'Anna Marie', 'Cruz', 'anna.cruz@techstartmnl.ph', '+639456789012', 'CTO', 'baguhan', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample Philippine deals
INSERT INTO deals (id, organization_id, contact_id, company_id, title, value_php, stage, probability, relationship_strength, expected_close_date, created_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Ayala Land CRM Implementation', 2500000, 'proposal', 75, 'strong', '2024-09-15', NOW()),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'SM Retail POS Integration', 5000000, 'negotiation', 85, 'excellent', '2024-08-30', NOW()),
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'TechStart Fintech Platform', 750000, 'qualified', 45, 'developing', '2024-10-01', NOW())
ON CONFLICT (id) DO NOTHING;