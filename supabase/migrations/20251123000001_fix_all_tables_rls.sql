-- =========================================
-- FIX ALL RLS POLICIES - FINAL VERSION
-- Execute this in Supabase Dashboard > SQL Editor
-- =========================================

-- =========================================
-- BRANCHES TABLE
-- =========================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'branches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.branches';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO anon, authenticated;
GRANT ALL ON public.branches TO service_role;

CREATE POLICY "branches_all_policy" ON public.branches FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- BRANCH_MEMBERS TABLE
-- =========================================
ALTER TABLE public.branch_members ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'branch_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.branch_members';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.branch_members TO anon, authenticated;
GRANT ALL ON public.branch_members TO service_role;

CREATE POLICY "branch_members_all_policy" ON public.branch_members FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- CATEGORIES TABLE
-- =========================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.categories';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;

CREATE POLICY "categories_all_policy" ON public.categories FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- TRANSACTIONS TABLE
-- =========================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.transactions';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transactions TO service_role;

CREATE POLICY "transactions_all_policy" ON public.transactions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- BUDGETS TABLE
-- =========================================
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'budgets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.budgets';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO anon, authenticated;
GRANT ALL ON public.budgets TO service_role;

CREATE POLICY "budgets_all_policy" ON public.budgets FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- REMINDERS TABLE
-- =========================================
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reminders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.reminders';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO anon, authenticated;
GRANT ALL ON public.reminders TO service_role;

CREATE POLICY "reminders_all_policy" ON public.reminders FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- GOALS TABLE
-- =========================================
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.goals';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;

CREATE POLICY "goals_all_policy" ON public.goals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- GOAL_CONTRIBUTIONS TABLE
-- =========================================
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goal_contributions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.goal_contributions';
    END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_contributions TO anon, authenticated;
GRANT ALL ON public.goal_contributions TO service_role;

CREATE POLICY "goal_contributions_all_policy" ON public.goal_contributions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- =========================================
-- VERIFY ALL POLICIES
-- =========================================
SELECT
  'TABLE: ' || tablename as info,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
