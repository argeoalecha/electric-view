-- supabase/migrations/20250724120003_philippines_crm_enhancements.sql
-- Enhanced CRM schema for Philippine market needs

-- Organizations table for multi-tenant SaaS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMPTZ,
  billing_email TEXT,
  -- Philippine business info
  business_type TEXT CHECK (business_type IN ('sole_proprietorship', 'partnership', 'corporation', 'cooperative')),
  tin TEXT, -- Tax Identification Number (Philippines)
  business_address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  -- Compliance fields
  data_privacy_consent BOOLEAN DEFAULT FALSE,
  data_privacy_consent_date TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  -- Billing
  currency TEXT DEFAULT 'PHP',
  timezone TEXT DEFAULT 'Asia/Manila',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization_id') THEN
    ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='position') THEN
    ALTER TABLE public.profiles ADD COLUMN position TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
    ALTER TABLE public.profiles ADD COLUMN department TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active') THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_login_at') THEN
    ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='preferred_language') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'tl', 'taglish'));
  END IF;
END $$;

-- Add organization_id to existing tables for multi-tenancy
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='organization_id') THEN
    ALTER TABLE public.companies ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='organization_id') THEN
    ALTER TABLE public.contacts ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='organization_id') THEN
    ALTER TABLE public.deals ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='organization_id') THEN
    ALTER TABLE public.activities ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

-- Enhanced contacts table for Filipino business culture
ALTER TABLE public.contacts ADD COLUMN middle_name TEXT;
ALTER TABLE public.contacts ADD COLUMN preferred_name TEXT; -- For nicknames common in PH
ALTER TABLE public.contacts ADD COLUMN mobile_number TEXT;
ALTER TABLE public.contacts ADD COLUMN landline TEXT;
ALTER TABLE public.contacts ADD COLUMN social_media JSONB; -- For FB, LinkedIn, etc.
ALTER TABLE public.contacts ADD COLUMN personal_notes TEXT; -- Relationship-driven culture
ALTER TABLE public.contacts ADD COLUMN birthday DATE;
ALTER TABLE public.contacts ADD COLUMN source TEXT; -- How did we meet them
ALTER TABLE public.contacts ADD COLUMN preferred_contact_method TEXT DEFAULT 'email' 
  CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'messenger', 'whatsapp'));
ALTER TABLE public.contacts ADD COLUMN tags TEXT[];
ALTER TABLE public.contacts ADD COLUMN is_decision_maker BOOLEAN DEFAULT FALSE;

-- Enhanced companies table
ALTER TABLE public.companies ADD COLUMN business_type TEXT 
  CHECK (business_type IN ('sole_proprietorship', 'partnership', 'corporation', 'cooperative', 'ngo'));
ALTER TABLE public.companies ADD COLUMN tin TEXT;
ALTER TABLE public.companies ADD COLUMN address TEXT;
ALTER TABLE public.companies ADD COLUMN city TEXT;
ALTER TABLE public.companies ADD COLUMN province TEXT;
ALTER TABLE public.companies ADD COLUMN postal_code TEXT;
ALTER TABLE public.companies ADD COLUMN website TEXT;
ALTER TABLE public.companies ADD COLUMN annual_revenue_php DECIMAL(15,2);
ALTER TABLE public.companies ADD COLUMN employee_count INTEGER;
ALTER TABLE public.companies ADD COLUMN main_products_services TEXT;
ALTER TABLE public.companies ADD COLUMN pain_points TEXT;
ALTER TABLE public.companies ADD COLUMN decision_making_process TEXT;

-- Enhanced deals table with PHP currency and local sales process
ALTER TABLE public.deals ADD COLUMN value_php DECIMAL(15,2);
ALTER TABLE public.deals ADD COLUMN probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100);
ALTER TABLE public.deals ADD COLUMN lead_source TEXT;
ALTER TABLE public.deals ADD COLUMN competitors TEXT[];
ALTER TABLE public.deals ADD COLUMN decision_factors TEXT[];
ALTER TABLE public.deals ADD COLUMN timeline_requirements TEXT;
ALTER TABLE public.deals ADD COLUMN budget_range TEXT;
ALTER TABLE public.deals ADD COLUMN authority_level TEXT; -- Who has decision authority
ALTER TABLE public.deals ADD COLUMN urgency_level TEXT DEFAULT 'medium' 
  CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE public.deals ADD COLUMN next_action TEXT;
ALTER TABLE public.deals ADD COLUMN next_action_date DATE;
ALTER TABLE public.deals ADD COLUMN relationship_strength TEXT DEFAULT 'new' 
  CHECK (relationship_strength IN ('new', 'developing', 'strong', 'champion'));

-- Tasks table for follow-up culture
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  task_type TEXT DEFAULT 'follow_up' CHECK (task_type IN ('follow_up', 'call', 'meeting', 'email', 'proposal', 'demo', 'other')),
  reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  -- Payment provider details
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('paymongo', 'xendit', 'stripe')),
  external_subscription_id TEXT,
  external_customer_id TEXT,
  -- Subscription details
  plan_name TEXT NOT NULL,
  plan_price_php DECIMAL(10,2) NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  user_limit INTEGER DEFAULT 1,
  contact_limit INTEGER DEFAULT 20,
  -- Status and dates
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  -- Payment method
  payment_method_type TEXT CHECK (payment_method_type IN ('gcash', 'maya', 'card', 'bank_transfer', 'over_the_counter')),
  last_payment_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  -- Transaction details
  external_transaction_id TEXT,
  payment_provider TEXT NOT NULL,
  amount_php DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT,
  -- Dates
  transaction_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  -- Metadata
  description TEXT,
  invoice_number TEXT,
  receipt_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity tracking enhancements
ALTER TABLE public.activities ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE public.activities ADD COLUMN created_by UUID REFERENCES profiles(id);
ALTER TABLE public.activities ADD COLUMN outcome TEXT;
ALTER TABLE public.activities ADD COLUMN follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE public.activities ADD COLUMN follow_up_date DATE;
ALTER TABLE public.activities ADD COLUMN tags TEXT[];
ALTER TABLE public.activities ADD COLUMN duration_minutes INTEGER;
ALTER TABLE public.activities ADD COLUMN location TEXT;
ALTER TABLE public.activities ADD COLUMN meeting_attendees TEXT[];

-- Data privacy compliance table
CREATE TABLE IF NOT EXISTS public.data_processing_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'read', 'update', 'delete', 'export', 'anonymize')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('contact', 'company', 'deal', 'activity', 'user')),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  purpose TEXT, -- Why was the data accessed/modified
  legal_basis TEXT CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'legitimate_interest')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_companies_organization ON companies(organization_id);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_phone ON contacts(mobile_number);
CREATE INDEX idx_deals_organization ON deals(organization_id);
CREATE INDEX idx_deals_value_php ON deals(value_php);
CREATE INDEX idx_deals_next_action_date ON deals(next_action_date);
CREATE INDEX idx_activities_organization ON activities(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payment_transactions_organization ON payment_transactions(organization_id);
CREATE INDEX idx_data_logs_organization ON data_processing_logs(organization_id);
CREATE INDEX idx_data_logs_created_at ON data_processing_logs(created_at);

-- Views for reporting and dashboards
CREATE VIEW organization_metrics AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.subscription_tier,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(DISTINCT c.id) as contact_count,
  COUNT(DISTINCT co.id) as company_count,
  COUNT(DISTINCT d.id) as deal_count,
  COALESCE(SUM(d.value_php), 0) as total_deal_value_php,
  COUNT(DISTINCT CASE WHEN d.stage = 'closed' THEN d.id END) as closed_deals,
  COUNT(DISTINCT CASE WHEN t.status = 'pending' AND t.due_date <= NOW() THEN t.id END) as overdue_tasks
FROM organizations o
LEFT JOIN profiles p ON o.id = p.organization_id AND p.is_active = TRUE
LEFT JOIN contacts c ON o.id = c.organization_id
LEFT JOIN companies co ON o.id = co.organization_id
LEFT JOIN deals d ON o.id = d.organization_id
LEFT JOIN tasks t ON o.id = t.organization_id
GROUP BY o.id, o.name, o.subscription_tier;

-- Philippine sales pipeline view
CREATE VIEW deals_pipeline_ph AS
SELECT 
  d.*,
  c.first_name || ' ' || COALESCE(c.middle_name || ' ', '') || c.last_name AS contact_full_name,
  c.preferred_name,
  c.mobile_number,
  c.preferred_contact_method,
  comp.name AS company_name,
  comp.city,
  comp.province,
  p.full_name AS assigned_to_name,
  CASE 
    WHEN d.next_action_date < CURRENT_DATE THEN 'overdue'
    WHEN d.next_action_date = CURRENT_DATE THEN 'due_today'
    WHEN d.next_action_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due_soon'
    ELSE 'on_track'
  END AS action_status
FROM deals d
LEFT JOIN contacts c ON d.contact_id = c.id
LEFT JOIN companies comp ON d.company_id = comp.id
LEFT JOIN profiles p ON d.contact_id = p.id;

-- Functions for Philippine business logic
CREATE OR REPLACE FUNCTION format_php_currency(amount DECIMAL)
RETURNS TEXT AS $$
BEGIN
  RETURN '₱' || TO_CHAR(amount, 'FM999,999,990.00');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_organization_usage(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  sub_record RECORD;
BEGIN
  -- Get subscription limits
  SELECT user_limit, contact_limit INTO sub_record
  FROM subscriptions 
  WHERE organization_id = org_id AND status = 'active'
  LIMIT 1;
  
  -- Get current usage
  SELECT jsonb_build_object(
    'users_used', (SELECT COUNT(*) FROM profiles WHERE organization_id = org_id AND is_active = TRUE),
    'users_limit', COALESCE(sub_record.user_limit, 1),
    'contacts_used', (SELECT COUNT(*) FROM contacts WHERE organization_id = org_id),
    'contacts_limit', COALESCE(sub_record.contact_limit, 20),
    'deals_count', (SELECT COUNT(*) FROM deals WHERE organization_id = org_id),
    'total_deal_value_php', (SELECT COALESCE(SUM(value_php), 0) FROM deals WHERE organization_id = org_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data processing for compliance
CREATE OR REPLACE FUNCTION log_data_access(
  org_id UUID,
  user_id UUID,
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID DEFAULT NULL,
  purpose TEXT DEFAULT 'business_operation'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO data_processing_logs (
    organization_id,
    user_id,
    action_type,
    resource_type,
    resource_id,
    purpose,
    legal_basis
  ) VALUES (
    org_id,
    user_id,
    action_type,
    resource_type,
    resource_id,
    purpose,
    'legitimate_interest'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;