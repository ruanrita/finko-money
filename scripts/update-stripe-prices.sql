-- ============================================================
-- Atualizar Price IDs do Stripe no Banco de Dados
-- ============================================================
--
-- ANTES DE EXECUTAR:
-- 1. Crie o produto "Plano Pro" no Stripe Dashboard
-- 2. Crie dois preços: mensal (R$ 15,90) e anual (R$ 159,00)
-- 3. Copie os IDs e substitua abaixo
--
-- ============================================================

-- 1. Atualizar Product ID do Plano Pro
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_COLE_SEU_PRODUCT_ID_AQUI',  -- ⚠️ Substitua!
  updated_at = NOW()
WHERE name = 'pro';

-- 2. Atualizar Preço Mensal (R$ 15,90/mês)
UPDATE subscription_prices
SET
  stripe_price_id = 'price_COLE_SEU_PRICE_MENSAL_AQUI',  -- ⚠️ Substitua!
  active = true
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
  AND interval = 'month';

-- 3. Atualizar Preço Anual (R$ 159,00/ano)
UPDATE subscription_prices
SET
  stripe_price_id = 'price_COLE_SEU_PRICE_ANUAL_AQUI',  -- ⚠️ Substitua!
  active = true
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
  AND interval = 'year';

-- ============================================================
-- Verificar se atualizou corretamente
-- ============================================================

SELECT
  sp.name AS plano,
  sp.display_name,
  sp.stripe_product_id,
  spr.stripe_price_id,
  spr.amount AS valor,
  spr.interval AS periodicidade
FROM subscription_plans sp
JOIN subscription_prices spr ON spr.plan_id = sp.id
WHERE sp.name = 'pro'
ORDER BY spr.interval;

-- Resultado esperado:
-- plano | display_name | stripe_product_id | stripe_price_id | valor  | periodicidade
-- ------|--------------|-------------------|-----------------|--------|---------------
-- pro   | Plano Pro    | prod_XXXXXXXX     | price_XXXXXXXX  | 15.90  | month
-- pro   | Plano Pro    | prod_XXXXXXXX     | price_XXXXXXXX  | 159.00 | year

-- ⚠️ Se aparecer "price_pro_monthly" ou "price_pro_yearly", você ainda tem placeholders!
-- ✅ Se aparecer IDs começando com "prod_" e "price_", está correto!
