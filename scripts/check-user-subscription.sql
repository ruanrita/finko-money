-- ============================================================
-- Verificar Assinatura de um Usuário
-- ============================================================
-- Mostra todas as informações de assinatura de um usuário
-- Útil para debug durante testes de webhook
-- ============================================================

-- Substitua 'test@example.com' pelo email do usuário que quer verificar
\set user_email 'test@example.com'

-- 1. Informações do Usuário
SELECT
  u.id,
  u.email,
  u.full_name,
  u.stripe_customer_id,
  u.subscription_status,
  u.subscription_current_period_end,
  u.is_early_adopter,
  sp.name AS plan_name,
  sp.display_name AS plan_display_name
FROM users u
LEFT JOIN subscription_plans sp ON sp.id = u.subscription_plan_id
WHERE u.email = :'user_email';

-- 2. Detalhes da Assinatura Stripe
SELECT
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.cancel_at_period_end,
  us.canceled_at,
  sp.name AS plan_name,
  spr.stripe_price_id,
  spr.amount,
  spr.interval
FROM user_subscriptions us
JOIN users u ON u.id = us.user_id
JOIN subscription_plans sp ON sp.id = us.plan_id
JOIN subscription_prices spr ON spr.id = us.price_id
WHERE u.email = :'user_email'
ORDER BY us.created_at DESC
LIMIT 1;

-- ============================================================
-- Interpretação dos Resultados
-- ============================================================

-- ✅ Assinatura Ativa:
--    subscription_status = 'active'
--    plan_name = 'pro'
--    stripe_subscription_id começa com 'sub_'

-- 🔄 Trial Ativo:
--    subscription_status = 'trialing'
--    current_period_end é a data fim do trial

-- ⚠️ Pagamento Atrasado:
--    subscription_status = 'past_due'
--    Stripe tentará cobrar novamente

-- ❌ Cancelada:
--    subscription_status = 'canceled'
--    cancel_at_period_end = true
--    canceled_at tem data

-- 🆓 Usuário Free:
--    subscription_status = 'active'
--    plan_name = 'free'
--    stripe_subscription_id = NULL

-- 🎁 Early Adopter:
--    is_early_adopter = true
--    subscription_status = 'grandfathered'
--    plan_name = 'initial_launch'
