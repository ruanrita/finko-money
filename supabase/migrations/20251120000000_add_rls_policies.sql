-- =========================================
-- ENABLE RLS (Row Level Security)
-- =========================================

-- Enable RLS on all tables except users (users table is public profile data)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; -- Disabled: public profile data
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- =========================================
-- USERS TABLE POLICIES
-- =========================================
-- RLS disabled for users table - it only contains public profile information
-- and is needed for JOINs with branch_members to display member names/emails

-- =========================================
-- BRANCHES TABLE POLICIES
-- =========================================

-- Users can read all branches (filtering done in app layer)
CREATE POLICY "Users can read branches"
  ON public.branches
  FOR SELECT
  USING (true);

-- Authenticated users can create branches
CREATE POLICY "Authenticated can create branches"
  ON public.branches
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update branches (authorization in service layer)
CREATE POLICY "Users can update branches"
  ON public.branches
  FOR UPDATE
  USING (true);

-- Users can delete branches (authorization in service layer)
CREATE POLICY "Users can delete branches"
  ON public.branches
  FOR DELETE
  USING (true);

-- =========================================
-- BRANCH_MEMBERS TABLE POLICIES
-- =========================================

-- Users can read all branch members
CREATE POLICY "Users can read all members"
  ON public.branch_members
  FOR SELECT
  USING (true);

-- Authenticated users can insert members (authorization in service layer)
CREATE POLICY "Authenticated can insert members"
  ON public.branch_members
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update members (authorization in service layer)
CREATE POLICY "Authenticated can update members"
  ON public.branch_members
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete members (authorization in service layer)
CREATE POLICY "Authenticated can delete members"
  ON public.branch_members
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================
-- CATEGORIES TABLE POLICIES
-- =========================================

-- Users can read all categories
CREATE POLICY "Users can read all categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- Authenticated users can create categories
CREATE POLICY "Authenticated can create categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update categories
CREATE POLICY "Authenticated can update categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete categories
CREATE POLICY "Authenticated can delete categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================
-- TRANSACTIONS TABLE POLICIES
-- =========================================

-- Users can read all transactions
CREATE POLICY "Users can read all transactions"
  ON public.transactions
  FOR SELECT
  USING (true);

-- Authenticated users can create transactions
CREATE POLICY "Authenticated can create transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update transactions
CREATE POLICY "Authenticated can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete transactions
CREATE POLICY "Authenticated can delete transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================
-- BUDGETS TABLE POLICIES
-- =========================================

-- Users can read their own budgets
CREATE POLICY "Users can read own budgets"
  ON public.budgets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own budgets
CREATE POLICY "Users can create own budgets"
  ON public.budgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================
-- REMINDERS TABLE POLICIES
-- =========================================

-- Users can read their own reminders
CREATE POLICY "Users can read own reminders"
  ON public.reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own reminders
CREATE POLICY "Users can create own reminders"
  ON public.reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reminders
CREATE POLICY "Users can update own reminders"
  ON public.reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reminders
CREATE POLICY "Users can delete own reminders"
  ON public.reminders
  FOR DELETE
  USING (auth.uid() = user_id);
