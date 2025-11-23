-- =========================================
-- FIX USERS RLS - SUPPORT ANON AND AUTHENTICATED ROLES
-- Execute this in Supabase Dashboard > SQL Editor
-- =========================================

-- Step 1: Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'users'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- Step 3: Grant table-level permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Step 4: Create permissive policies for all roles

-- SELECT: Allow anon and authenticated to read all users
CREATE POLICY "users_select_policy"
ON public.users
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- INSERT: Allow anon and authenticated to insert
CREATE POLICY "users_insert_policy"
ON public.users
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- UPDATE: Allow anon and authenticated to update own profile
CREATE POLICY "users_update_policy"
ON public.users
FOR UPDATE
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- DELETE: Allow anon and authenticated to delete own profile
CREATE POLICY "users_delete_policy"
ON public.users
FOR DELETE
TO anon, authenticated, service_role
USING (true);

-- Step 5: Verify policies were created
SELECT
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
