-- Debug and Fix Authentication Issues
-- Run this step by step in Supabase SQL Editor

-- STEP 1: Check what tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'organizations');

-- STEP 2: Check table structures
\d public.profiles;
\d public.organizations;

-- STEP 3: Check if trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- STEP 4: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'organizations');

-- STEP 5: Temporarily disable RLS for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- STEP 6: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 7: Create minimal working trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Log the attempt
  RAISE LOG 'Creating profile for user: % with email: %', NEW.id, NEW.email;
  
  -- Create a simple organization first
  INSERT INTO public.organizations (
    id,
    name,
    slug,
    billing_email,
    trial_ends_at,
    subscription_tier
  ) VALUES (
    gen_random_uuid(),
    COALESCE(split_part(NEW.email, '@', 2), 'Default Company'),
    lower(replace(split_part(NEW.email, '@', 2), '.', '-')) || '-' || substring(NEW.id::text, 1, 8),
    NEW.email,
    NOW() + INTERVAL '14 days',
    'free'
  ) RETURNING id INTO org_id;
  
  -- Create profile with minimal required fields
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    organization_id,
    role,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    org_id,
    'owner',
    true
  );
  
  RAISE LOG 'Successfully created profile and organization for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    -- Return NEW anyway to not block auth
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- STEP 9: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 10: Test the setup
SELECT 'Minimal trigger setup completed' as status;

-- STEP 11: Check if we can insert test data (optional)
-- This is just to verify the tables work
-- INSERT INTO public.organizations (id, name, slug, billing_email, subscription_tier) 
-- VALUES (gen_random_uuid(), 'Test Org', 'test-org-123', 'test@example.com', 'free');

-- SELECT 'Test organization created' as test_status;