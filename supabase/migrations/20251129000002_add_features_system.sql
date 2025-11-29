-- Migration: Dynamic Features System
-- Allows admin to control which features are available in each plan

-- =====================================================
-- 1. CREATE FEATURES TABLE
-- =====================================================
CREATE TABLE features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- Technical identifier (e.g., 'reports', 'budgets')
  display_name text NOT NULL, -- Display name (e.g., 'Relatórios')
  description text,
  path text NOT NULL, -- Route path (e.g., '/relatorios')
  icon text, -- Lucide icon name (e.g., 'BarChart3')
  is_core boolean DEFAULT false, -- Core features always available (dashboard, settings)
  sort_order integer DEFAULT 0, -- Order for display
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CREATE PLAN_FEATURES TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES features(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, feature_id)
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_id ON plan_features(feature_id);
CREATE INDEX idx_features_path ON features(path);
CREATE INDEX idx_features_is_core ON features(is_core);

-- =====================================================
-- 4. POPULATE FEATURES
-- =====================================================
INSERT INTO features (name, display_name, description, path, icon, is_core, sort_order) VALUES
  -- Core features (always available)
  ('dashboard', 'Dashboard', 'Visão geral das finanças', '/dashboard', 'LayoutDashboard', true, 1),
  ('settings', 'Configurações', 'Configurações da conta e workspace', '/configuracoes', 'Settings', true, 99),

  -- Premium features (can be restricted by plan)
  ('transactions', 'Despesas e Receitas', 'Gerencie suas transações financeiras', '/financeiro', 'Receipt', false, 2),
  ('categories', 'Categorias', 'Organize suas transações por categoria', '/categorias', 'FolderTree', false, 3),
  ('budgets', 'Orçamentos', 'Controle seus gastos por categoria', '/orcamentos', 'Wallet', false, 4),
  ('goals', 'Metas', 'Defina e acompanhe metas financeiras', '/metas', 'Target', false, 5),
  ('reminders', 'Lembretes', 'Alertas para transações importantes', '/lembretes', 'Bell', false, 6),
  ('reports', 'Relatórios', 'Análise detalhada das suas finanças', '/relatorios', 'BarChart3', false, 7),
  ('team', 'Equipe', 'Gerencie membros do workspace', '/equipe', 'Users', false, 8);

-- =====================================================
-- 5. POPULATE PLAN_FEATURES (All plans get all features initially)
-- =====================================================
-- This ensures backward compatibility - all existing features available to all plans
-- Admin can later remove features from specific plans via the admin panel

INSERT INTO plan_features (plan_id, feature_id)
SELECT
  sp.id as plan_id,
  f.id as feature_id
FROM subscription_plans sp
CROSS JOIN features f
WHERE f.is_core = false; -- Core features don't need explicit assignment

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Anyone can read features (needed for navigation)
CREATE POLICY "Features are viewable by everyone"
  ON features FOR SELECT
  USING (true);

-- Anyone can read plan_features (needed to check access)
CREATE POLICY "Plan features are viewable by everyone"
  ON plan_features FOR SELECT
  USING (true);

-- Only admins can modify features
CREATE POLICY "Only admins can insert features"
  ON features FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can update features"
  ON features FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete features"
  ON features FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Only admins can modify plan_features
CREATE POLICY "Only admins can insert plan features"
  ON plan_features FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete plan features"
  ON plan_features FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- =====================================================
-- 7. CREATE HELPER FUNCTION
-- =====================================================
-- Function to check if a user has access to a feature
CREATE OR REPLACE FUNCTION user_has_feature_access(
  user_id_param uuid,
  feature_path_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_is_admin boolean;
  user_is_early_adopter boolean;
  feature_is_core boolean;
  user_plan_id uuid;
  has_access boolean;
BEGIN
  -- Get user info
  SELECT is_admin, is_early_adopter, subscription_plan_id
  INTO user_is_admin, user_is_early_adopter, user_plan_id
  FROM users
  WHERE id = user_id_param;

  -- Admins and early adopters have access to everything
  IF user_is_admin = true OR user_is_early_adopter = true THEN
    RETURN true;
  END IF;

  -- Get feature info
  SELECT is_core INTO feature_is_core
  FROM features
  WHERE path = feature_path_param;

  -- Core features are always accessible
  IF feature_is_core = true THEN
    RETURN true;
  END IF;

  -- Check if user's plan includes this feature
  SELECT EXISTS (
    SELECT 1
    FROM plan_features pf
    JOIN features f ON f.id = pf.feature_id
    WHERE pf.plan_id = user_plan_id
    AND f.path = feature_path_param
  ) INTO has_access;

  RETURN COALESCE(has_access, false);
END;
$$;

-- =====================================================
-- 8. CREATE VIEW FOR EASY QUERYING
-- =====================================================
CREATE OR REPLACE VIEW plan_features_view AS
SELECT
  sp.id as plan_id,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  f.id as feature_id,
  f.name as feature_name,
  f.display_name as feature_display_name,
  f.path as feature_path,
  f.icon as feature_icon,
  f.is_core as is_core_feature,
  pf.id as assignment_id
FROM subscription_plans sp
CROSS JOIN features f
LEFT JOIN plan_features pf ON pf.plan_id = sp.id AND pf.feature_id = f.id
WHERE f.is_core = false
ORDER BY sp.name, f.sort_order;

-- Grant access to authenticated users
GRANT SELECT ON plan_features_view TO authenticated;
