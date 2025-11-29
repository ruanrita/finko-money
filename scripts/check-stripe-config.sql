-- ============================================================
-- Verificar Configuração Stripe no Banco de Dados
-- ============================================================
-- Execute este script para ver o status atual dos price IDs
-- ============================================================

-- 1. Ver todos os planos e preços
SELECT
  sp.name AS plano,
  sp.display_name,
  sp.stripe_product_id AS product_id,
  sp.is_active AS plano_ativo,
  spr.stripe_price_id AS price_id,
  spr.amount AS valor,
  spr.currency AS moeda,
  spr.interval AS periodo,
  spr.active AS preco_ativo
FROM subscription_plans sp
LEFT JOIN subscription_prices spr ON spr.plan_id = sp.id
WHERE sp.is_active = true
ORDER BY sp.name, spr.interval;

-- ============================================================
-- Diagnóstico
-- ============================================================

-- ✅ CONFIGURADO CORRETAMENTE:
-- - product_id começa com "prod_"
-- - price_id começa com "price_"
-- - Valores estão corretos (15.90 e 159.00)

-- ❌ PRECISA CONFIGURAR:
-- - product_id é NULL ou "prod_XXXXXXXXX"
-- - price_id é "price_pro_monthly" ou "price_pro_yearly"
-- - Esses são placeholders, não IDs reais!

-- ============================================================
-- Se precisa configurar:
-- ============================================================

-- Opção 1 - Script Automático (Recomendado):
--   1. Configure STRIPE_SECRET_KEY no .env.local
--   2. Execute: npx tsx scripts/create-stripe-products.ts

-- Opção 2 - Manual:
--   1. Crie produtos no Stripe Dashboard
--   2. Copie os IDs
--   3. Execute: scripts/update-stripe-prices.sql
