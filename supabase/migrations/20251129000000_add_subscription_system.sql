-- Migration: Add Subscription System (Fase 1 - Lançamento Inicial)
-- Description: Cria sistema de planos de assinatura com limitações de recursos
-- Date: 2025-11-29

-- ====================================================================================
-- 1. CRIAR TABELA DE PLANOS
-- ====================================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  stripe_product_id VARCHAR(100),

  -- Limites de recursos
  max_transactions INTEGER,
  max_categories INTEGER,
  max_goals INTEGER,
  max_budgets INTEGER,
  max_team_members INTEGER,
  max_branches INTEGER,
  max_reminders INTEGER,

  -- Features
  has_advanced_reports BOOLEAN DEFAULT false,
  export_formats TEXT[],
  support_level VARCHAR(50),
  history_months INTEGER, -- null = ilimitado

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- ====================================================================================
-- 2. ADICIONAR COLUNAS NA TABELA USERS
-- ====================================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_early_adopter BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS early_adopter_registered_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- ====================================================================================
-- 3. INSERIR PLANO INICIAL (FASE 1)
-- ====================================================================================

INSERT INTO subscription_plans (
  name,
  display_name,
  max_transactions,
  max_categories,
  max_goals,
  max_budgets,
  max_team_members,
  max_branches,
  max_reminders,
  has_advanced_reports,
  export_formats,
  support_level,
  history_months
) VALUES (
  'initial_launch',
  'Lançamento Inicial',
  50,                           -- 50 transações/mês
  5,                            -- 5 categorias customizadas
  3,                            -- 3 metas financeiras
  3,                            -- 3 orçamentos
  4,                            -- 4 membros extras (early adopters)
  3,                            -- 3 branches próprias
  6,                            -- 6 lembretes via email
  true,                         -- relatórios inclusos
  ARRAY['csv', 'pdf', 'excel'], -- exportação completa
  'email',                      -- suporte email
  24                            -- 2 anos (24 meses)
) ON CONFLICT (name) DO NOTHING;

-- ====================================================================================
-- 4. ATRIBUIR PLANO INICIAL A TODOS OS USUÁRIOS EXISTENTES
-- ====================================================================================

UPDATE users
SET
  subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'initial_launch'),
  subscription_status = 'active',
  is_early_adopter = true,
  early_adopter_registered_at = COALESCE(created_at, NOW())
WHERE subscription_plan_id IS NULL;

-- ====================================================================================
-- 5. CRIAR TRIGGER PARA NOVOS USUÁRIOS (FASE 1)
-- ====================================================================================

CREATE OR REPLACE FUNCTION assign_initial_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Durante Fase 1, todos ganham o plano inicial
  IF NEW.subscription_plan_id IS NULL THEN
    NEW.subscription_plan_id := (SELECT id FROM subscription_plans WHERE name = 'initial_launch' LIMIT 1);
    NEW.subscription_status := 'active';
    NEW.is_early_adopter := true;
    NEW.early_adopter_registered_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_initial_plan ON users;
CREATE TRIGGER trigger_assign_initial_plan
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_initial_plan();

-- ====================================================================================
-- 6. CRIAR TABELA DE TRACKING DE USO
-- ====================================================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- 'transaction', 'category', 'goal', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start, period_end)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource ON usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- ====================================================================================
-- 7. RLS POLICIES
-- ====================================================================================

-- subscription_plans: apenas leitura para usuários autenticados
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view subscription plans" ON subscription_plans;
CREATE POLICY "Users can view subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- usage_tracking: usuários podem ver apenas seus próprios dados
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can view their own usage tracking"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can insert their own usage tracking"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can update their own usage tracking"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ====================================================================================
-- 8. COMMENTS
-- ====================================================================================

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis no sistema';
COMMENT ON TABLE usage_tracking IS 'Tracking de uso de recursos por usuário';
COMMENT ON COLUMN subscription_plans.max_transactions IS 'Limite de transações por mês (null = ilimitado)';
COMMENT ON COLUMN subscription_plans.max_team_members IS 'Número máximo de membros na equipe';
COMMENT ON COLUMN subscription_plans.max_branches IS 'Número máximo de branches próprias';
COMMENT ON COLUMN subscription_plans.max_reminders IS 'Número máximo de lembretes via email';
COMMENT ON COLUMN users.subscription_plan_id IS 'Plano de assinatura atual do usuário';
COMMENT ON COLUMN users.is_early_adopter IS 'Usuário cadastrado antes do sistema de assinaturas (Fase 2)';
