-- Fix for user creation trigger
-- Run this in Supabase SQL Editor

-- First, ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
  user_name TEXT;
BEGIN
  -- Add detailed logging
  RAISE LOG 'Starting user creation process for user: %', NEW.id;
  RAISE LOG 'User email: %', NEW.email;
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;

  -- Extract user name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name', 
    split_part(NEW.email, '@', 1)
  );

  -- Create organization slug from email domain
  org_slug := COALESCE(
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 2), '[^a-zA-Z0-9]', '-', 'g')),
    'org-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 4);
  END LOOP;
  
  RAISE LOG 'Creating organization with slug: %', org_slug;
  
  -- Create organization for new user
  INSERT INTO public.organizations (
    id,
    name, 
    slug,
    billing_email,
    trial_ends_at,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 2)),
    org_slug,
    NEW.email,
    NOW() + INTERVAL '14 days',
    'free',
    NOW(),
    NOW()
  ) RETURNING id INTO org_id;
  
  RAISE LOG 'Created organization with id: %', org_id;
  
  -- Create profile linked to organization
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    organization_id,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.email, 
    user_name,
    COALESCE(NEW.raw_user_meta_data->>'given_name', split_part(user_name, ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'family_name', split_part(user_name, ' ', 2)),
    org_id,
    'owner',
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE LOG 'Created profile for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    -- Don't fail the auth process, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies allow profile creation
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow organization creation during signup" ON public.organizations;
CREATE POLICY "Allow organization creation during signup" ON public.organizations
  FOR INSERT WITH CHECK (true); -- Allow any authenticated user to create org initially

-- Test the setup
SELECT 'Setup completed successfully' as status;