-- Emergency bypass: Disable trigger and RLS temporarily
-- This will allow users to sign up while we debug

-- Remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Disable RLS to allow signup
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows everything temporarily
DROP POLICY IF EXISTS "Allow all operations temporarily" ON public.profiles;
CREATE POLICY "Allow all operations temporarily" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations temporarily" ON public.organizations;  
CREATE POLICY "Allow all operations temporarily" ON public.organizations
  FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

SELECT 'Emergency bypass activated - users can now sign up' as status;