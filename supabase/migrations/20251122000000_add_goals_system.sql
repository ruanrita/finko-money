-- =========================================
-- CREATE ENUMS FOR GOALS
-- =========================================

-- Goal types
CREATE TYPE goal_type AS ENUM ('emergency_fund', 'savings', 'debt_payoff', 'purchase');

-- Priority levels
CREATE TYPE goal_priority AS ENUM ('critical', 'high', 'medium', 'low');

-- =========================================
-- CREATE GOALS TABLE
-- =========================================

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,

  -- Identification
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',

  -- Type and Priority
  goal_type goal_type NOT NULL DEFAULT 'savings',
  priority goal_priority NOT NULL DEFAULT 'medium',

  -- Amounts
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),

  -- Dates
  target_date DATE,
  achieved_at TIMESTAMPTZ,

  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_contribute BOOLEAN NOT NULL DEFAULT false,
  monthly_target DECIMAL(12, 2),

  -- Optional category link
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure current amount doesn't exceed target
  CONSTRAINT check_amounts CHECK (current_amount <= target_amount)
);

-- =========================================
-- CREATE GOAL CONTRIBUTIONS TABLE
-- =========================================

CREATE TABLE public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Contribution details
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,

  -- Optional transaction link
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  contributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- CREATE INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_branch_id ON public.goals(branch_id);
CREATE INDEX idx_goals_goal_type ON public.goals(goal_type);
CREATE INDEX idx_goals_is_active ON public.goals(is_active);
CREATE INDEX idx_goals_priority ON public.goals(priority);
CREATE INDEX idx_goals_target_date ON public.goals(target_date);

CREATE INDEX idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user_id ON public.goal_contributions(user_id);
CREATE INDEX idx_goal_contributions_contributed_at ON public.goal_contributions(contributed_at);
CREATE INDEX idx_goal_contributions_transaction_id ON public.goal_contributions(transaction_id);

-- =========================================
-- CREATE TRIGGER FOR UPDATED_AT
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for goals table
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- CREATE FUNCTION TO UPDATE GOAL AMOUNT
-- =========================================

-- Function to automatically update goal current_amount when contribution is added
CREATE OR REPLACE FUNCTION public.update_goal_current_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_new_amount DECIMAL(12, 2);
  v_target_amount DECIMAL(12, 2);
BEGIN
  -- Calculate new current amount
  SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
  FROM public.goal_contributions
  WHERE goal_id = NEW.goal_id;

  -- Get target amount
  SELECT target_amount INTO v_target_amount
  FROM public.goals
  WHERE id = NEW.goal_id;

  -- Update goal current_amount
  UPDATE public.goals
  SET current_amount = v_new_amount,
      achieved_at = CASE
        WHEN v_new_amount >= v_target_amount AND achieved_at IS NULL THEN NOW()
        WHEN v_new_amount < v_target_amount THEN NULL
        ELSE achieved_at
      END
  WHERE id = NEW.goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal amount on contribution insert
CREATE TRIGGER update_goal_on_contribution_insert
  AFTER INSERT ON public.goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_current_amount();

-- Trigger to update goal amount on contribution delete
CREATE TRIGGER update_goal_on_contribution_delete
  AFTER DELETE ON public.goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_current_amount();

-- =========================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- =========================================
-- GOALS TABLE POLICIES
-- =========================================

-- Users can read all goals (filtering done in service layer)
CREATE POLICY "Users can read all goals"
  ON public.goals
  FOR SELECT
  USING (true);

-- Authenticated users can create goals
CREATE POLICY "Authenticated can create goals"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update goals
CREATE POLICY "Authenticated can update goals"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete goals
CREATE POLICY "Authenticated can delete goals"
  ON public.goals
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================
-- GOAL CONTRIBUTIONS TABLE POLICIES
-- =========================================

-- Users can read all goal contributions
CREATE POLICY "Users can read all contributions"
  ON public.goal_contributions
  FOR SELECT
  USING (true);

-- Authenticated users can create contributions
CREATE POLICY "Authenticated can create contributions"
  ON public.goal_contributions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update contributions
CREATE POLICY "Authenticated can update contributions"
  ON public.goal_contributions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete contributions
CREATE POLICY "Authenticated can delete contributions"
  ON public.goal_contributions
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
