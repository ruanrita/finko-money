-- ============================================
-- FASE 2: ATIVAR SISTEMA DE ASSINATURAS
-- ============================================
-- Esta migration marca usuários atuais como Early Adopters
-- e cria os planos Free e Pro com integração Stripe

-- 1. Marcar todos os usuários atuais como Early Adopters
UPDATE users
SET
  is_early_adopter = true,
  early_adopter_registered_at = created_at,
  subscription_status = 'grandfathered'
WHERE is_early_adopter = false OR is_early_adopter IS NULL;

-- 2. Criar planos Free e Pro
INSERT INTO subscription_plans (
  name, display_name, stripe_product_id,
  max_transactions, max_categories, max_goals, max_budgets,
  max_team_members, max_branches, max_reminders,
  has_advanced_reports, export_formats, support_level, history_months
) VALUES
(
  'free', 'Plano Free', NULL,
  50, 5, 3, 3,
  2, 2, 3,
  true, ARRAY['csv'], 'email', 6
),
(
  'pro', 'Plano Pro', 'prod_XXXXXXXXX', -- ⚠️ SUBSTITUIR pelo ID do produto Stripe
  300, 20, 15, 10,
  10, 5, 15,
  true, ARRAY['csv', 'pdf', 'excel'], 'email', 36
)
ON CONFLICT (name) DO NOTHING;

-- 3. Criar tabela de prices
CREATE TABLE IF NOT EXISTS subscription_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  interval VARCHAR(20) NOT NULL, -- 'month' ou 'year'
  interval_count INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Inserir prices do Pro
INSERT INTO subscription_prices (plan_id, stripe_price_id, amount, interval)
SELECT
  sp.id,
  'price_pro_monthly', -- ⚠️ SUBSTITUIR pelo ID do price mensal do Stripe
  15.90,
  'month'
FROM subscription_plans sp
WHERE sp.name = 'pro'
ON CONFLICT (stripe_price_id) DO NOTHING;

INSERT INTO subscription_prices (plan_id, stripe_price_id, amount, interval)
SELECT
  sp.id,
  'price_pro_yearly', -- ⚠️ SUBSTITUIR pelo ID do price anual do Stripe
  159.00,
  'year'
FROM subscription_plans sp
WHERE sp.name = 'pro'
ON CONFLICT (stripe_price_id) DO NOTHING;

-- 5. Criar tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(100) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(100) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id),
  price_id UUID REFERENCES subscription_prices(id),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_prices_plan ON subscription_prices(plan_id);

-- 7. RLS Policies
ALTER TABLE subscription_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view prices" ON subscription_prices;
CREATE POLICY "Users can view prices"
  ON subscription_prices
  FOR SELECT
  TO authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 8. Criar tabela de configuração do sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Inserir configuração de assinaturas (desativado por padrão)
INSERT INTO system_config (key, value, description)
VALUES ('subscriptions_enabled', 'false', 'Ativa/desativa o sistema de assinaturas pagas')
ON CONFLICT (key) DO NOTHING;

-- 9. Atualizar trigger para novos usuários (Fase 2)
CREATE OR REPLACE FUNCTION assign_initial_plan()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscriptions_active BOOLEAN;
BEGIN
  -- Verificar se assinaturas estão ativas
  SELECT value::boolean INTO subscriptions_active
  FROM system_config
  WHERE key = 'subscriptions_enabled'
  LIMIT 1;

  IF NEW.subscription_plan_id IS NULL THEN
    IF subscriptions_active THEN
      -- Assinaturas ativas: novo usuário ganha plano Free
      NEW.subscription_plan_id := (SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1);
      NEW.subscription_status := 'active';
      NEW.is_early_adopter := false;
    ELSE
      -- Assinaturas desativadas: novo usuário é early adopter
      NEW.subscription_plan_id := (SELECT id FROM subscription_plans WHERE name = 'initial_launch' LIMIT 1);
      NEW.subscription_status := 'active';
      NEW.is_early_adopter := true;
      NEW.early_adopter_registered_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS para system_config
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view system config" ON system_config;
CREATE POLICY "Anyone can view system config"
  ON system_config
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can update system config" ON system_config;
CREATE POLICY "Only admins can update system config"
  ON system_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE subscription_prices IS 'Armazena os preços de cada plano (mensal/anual) com integração Stripe';
COMMENT ON TABLE user_subscriptions IS 'Histórico de assinaturas dos usuários no Stripe';
COMMENT ON TABLE system_config IS 'Configurações globais do sistema (ex: ativar/desativar assinaturas)';
COMMENT ON COLUMN users.is_early_adopter IS 'True para usuários que ganham acesso vitalício (cadastrados antes de ativar assinaturas)';
COMMENT ON COLUMN users.subscription_status IS 'Status: active, canceled, grandfathered (early adopters), past_due, etc.';
