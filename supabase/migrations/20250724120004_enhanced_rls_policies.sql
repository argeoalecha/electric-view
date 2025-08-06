-- supabase/migrations/20250724120004_enhanced_rls_policies.sql
-- Multi-tenant RLS policies for Philippine CRM

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON deals;
DROP POLICY IF EXISTS "Authenticated users can manage activities" ON activities;

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = required_role OR role = 'owner'
    FROM profiles 
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id = auth.user_organization_id());

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    id = auth.user_organization_id() AND 
    auth.user_has_role('owner')
  );

-- Profiles policies (enhanced)
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage team members" ON profiles
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND
    (auth.user_has_role('owner') OR auth.user_has_role('admin'))
  );

-- Companies policies (multi-tenant)
CREATE POLICY "Users can manage companies in their organization" ON companies
  FOR ALL USING (organization_id = auth.user_organization_id());

-- Contacts policies (multi-tenant)
CREATE POLICY "Users can manage contacts in their organization" ON contacts
  FOR ALL USING (organization_id = auth.user_organization_id());

-- Deals policies (multi-tenant with role-based access)
CREATE POLICY "Users can view deals in their organization" ON deals
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create deals in their organization" ON deals
  FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update their assigned deals or managers can update all" ON deals
  FOR UPDATE USING (
    organization_id = auth.user_organization_id() AND (
      contact_id IN (SELECT id FROM profiles WHERE id = auth.uid()) OR
      auth.user_has_role('manager') OR 
      auth.user_has_role('admin') OR 
      auth.user_has_role('owner')
    )
  );

CREATE POLICY "Managers can delete deals" ON deals
  FOR DELETE USING (
    organization_id = auth.user_organization_id() AND (
      auth.user_has_role('manager') OR 
      auth.user_has_role('admin') OR 
      auth.user_has_role('owner')
    )
  );

-- Activities policies (multi-tenant)
CREATE POLICY "Users can manage activities in their organization" ON activities
  FOR ALL USING (organization_id = auth.user_organization_id());

-- Tasks policies (role-based)
CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create tasks in their organization" ON tasks
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id() AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their assigned tasks or tasks they created" ON tasks
  FOR UPDATE USING (
    organization_id = auth.user_organization_id() AND (
      assigned_to = auth.uid() OR 
      created_by = auth.uid() OR
      auth.user_has_role('manager')
    )
  );

-- Subscriptions policies (admin only)
CREATE POLICY "Admins can view organization subscription" ON subscriptions
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND
    (auth.user_has_role('owner') OR auth.user_has_role('admin'))
  );

CREATE POLICY "Owners can manage subscription" ON subscriptions
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND
    auth.user_has_role('owner')
  );

-- Payment transactions policies (admin only)
CREATE POLICY "Admins can view payment transactions" ON payment_transactions
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND
    (auth.user_has_role('owner') OR auth.user_has_role('admin'))
  );

-- Data processing logs policies (compliance)
CREATE POLICY "Admins can view data processing logs" ON data_processing_logs
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND
    auth.user_has_role('owner')
  );

CREATE POLICY "System can insert data processing logs" ON data_processing_logs
  FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());

-- Triggers for automatic data logging (compliance)
CREATE OR REPLACE FUNCTION log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log data access for compliance
  PERFORM log_data_access(
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP::TEXT,
    'contact',
    COALESCE(NEW.id, OLD.id),
    'crm_operations'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER contact_access_log
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION log_contact_access();

-- Function to ensure organization assignment
CREATE OR REPLACE FUNCTION ensure_organization_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign organization_id if not provided
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := auth.user_organization_id();
  END IF;
  
  -- Ensure user can only create records in their organization
  IF NEW.organization_id != auth.user_organization_id() THEN
    RAISE EXCEPTION 'Cannot create records outside your organization';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply organization assignment to relevant tables
CREATE TRIGGER ensure_companies_organization
  BEFORE INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION ensure_organization_assignment();

CREATE TRIGGER ensure_contacts_organization
  BEFORE INSERT ON contacts
  FOR EACH ROW EXECUTE FUNCTION ensure_organization_assignment();

CREATE TRIGGER ensure_deals_organization
  BEFORE INSERT ON deals
  FOR EACH ROW EXECUTE FUNCTION ensure_organization_assignment();

CREATE TRIGGER ensure_activities_organization
  BEFORE INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION ensure_organization_assignment();

CREATE TRIGGER ensure_tasks_organization
  BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION ensure_organization_assignment();

-- Updated profile creation function for organizations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Add error handling and logging
  RAISE LOG 'Creating new user profile for %', NEW.email;
  -- Create organization slug from email domain or use UUID
  org_slug := COALESCE(
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 2), '[^a-zA-Z0-9]', '-', 'g')),
    'org-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 4);
  END LOOP;
  
  -- Create organization for new user
  INSERT INTO public.organizations (
    name, 
    slug,
    billing_email,
    trial_ends_at,
    subscription_tier
  ) VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 2)),
    org_slug,
    NEW.email,
    NOW() + INTERVAL '14 days', -- 14-day trial
    'free'
  ) RETURNING id INTO org_id;
  
  -- Create profile linked to organization
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    organization_id,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    org_id,
    'owner', -- First user is owner
    TRUE,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RAISE EXCEPTION 'Database error saving new user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;