# 🔧 Configuração de Produtos e Preços no Stripe

Este guia mostra como criar os produtos e preços no Stripe Dashboard e atualizar o banco de dados com os IDs corretos.

## Opção 1: Stripe Dashboard (Recomendado para Iniciantes)

### Passo 1: Acessar o Stripe Dashboard

1. Acesse https://dashboard.stripe.com/test/products
2. Certifique-se de estar no modo **Test** (canto superior direito)

### Passo 2: Criar Produto Pro

1. Clique em **"Create product"**
2. Preencha:
   - **Name**: `Plano Pro`
   - **Description**: `Plano profissional com recursos avançados`
   - **Pricing model**: `Standard pricing`

3. Adicionar preço mensal:
   - **Price**: `15.90`
   - **Billing period**: `Monthly`
   - **Currency**: `BRL`
   - Clique em **"Add another price"**

4. Adicionar preço anual:
   - **Price**: `159.00`
   - **Billing period**: `Yearly`
   - **Currency**: `BRL`

5. Clique em **"Save product"**

### Passo 3: Copiar os IDs

Após criar o produto, você verá:

```
Product ID: prod_XXXXXXXXXXXXXXXX

Prices:
  - Monthly: price_XXXXXXXXXXXXXXXX (R$15.90/month)
  - Yearly: price_XXXXXXXXXXXXXXXX (R$159.00/year)
```

**Copie esses IDs! Você precisará deles no próximo passo.**

### Passo 4: Atualizar o Banco de Dados

Execute os seguintes SQLs no Supabase, substituindo os IDs pelos que você copiou:

```sql
-- 1. Atualizar o produto ID do plano Pro
UPDATE subscription_plans
SET stripe_product_id = 'prod_XXXXXXXXXXXXXXXX' -- Substitua pelo Product ID real
WHERE name = 'pro';

-- 2. Inserir preços na tabela subscription_prices
-- Preço mensal
INSERT INTO subscription_prices (
  plan_id,
  stripe_price_id,
  amount,
  currency,
  interval,
  interval_count,
  active
) VALUES (
  (SELECT id FROM subscription_plans WHERE name = 'pro'),
  'price_XXXXXXXXXXXXXXXX', -- Substitua pelo Price ID mensal
  15.90,
  'BRL',
  'month',
  1,
  true
);

-- Preço anual
INSERT INTO subscription_prices (
  plan_id,
  stripe_price_id,
  amount,
  currency,
  interval,
  interval_count,
  active
) VALUES (
  (SELECT id FROM subscription_plans WHERE name = 'pro'),
  'price_XXXXXXXXXXXXXXXX', -- Substitua pelo Price ID anual
  159.00,
  'BRL',
  'year',
  1,
  true
);
```

### Passo 5: Atualizar a Página de Pricing

Edite `app/pricing/page.tsx` e substitua os price IDs hardcoded:

```typescript
// Antes
priceId: {
  month: 'price_pro_monthly',  // ❌ Placeholder
  year: 'price_pro_yearly'     // ❌ Placeholder
}

// Depois
priceId: {
  month: 'price_XXXXXXXXXXXXXXXX',  // ✅ ID real do Stripe
  year: 'price_XXXXXXXXXXXXXXXX'    // ✅ ID real do Stripe
}
```

## Opção 2: Stripe CLI (Automático)

Se você tem o Stripe CLI instalado, pode criar os produtos via script:

```bash
# Criar produto Pro
stripe products create \
  --name="Plano Pro" \
  --description="Plano profissional com recursos avançados"

# Criar preço mensal (substitua prod_XXX pelo ID retornado acima)
stripe prices create \
  --product=prod_XXX \
  --unit-amount=1590 \
  --currency=brl \
  --recurring[interval]=month

# Criar preço anual
stripe prices create \
  --product=prod_XXX \
  --unit-amount=15900 \
  --currency=brl \
  --recurring[interval]=year
```

## Opção 3: Buscar Preços do Banco (Melhor Prática)

Em vez de hardcode, busque os price IDs do banco de dados:

### 1. Criar API Route

```typescript
// app/api/subscription/prices/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { data: prices, error } = await supabaseAdmin
    .from('subscription_prices')
    .select(`
      id,
      stripe_price_id,
      amount,
      currency,
      interval,
      subscription_plans (
        name,
        display_name
      )
    `)
    .eq('active', true)
    .order('amount', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prices });
}
```

### 2. Atualizar Página de Pricing

```typescript
// app/pricing/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function PricingPage() {
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    async function loadPrices() {
      const res = await fetch('/api/subscription/prices');
      const data = await res.json();
      setPrices(data.prices);
    }
    loadPrices();
  }, []);

  // Buscar price IDs dinamicamente
  const proMonthly = prices.find(p =>
    p.subscription_plans.name === 'pro' && p.interval === 'month'
  );
  const proYearly = prices.find(p =>
    p.subscription_plans.name === 'pro' && p.interval === 'year'
  );

  // Usar no componente
  priceId: {
    month: proMonthly?.stripe_price_id,
    year: proYearly?.stripe_price_id
  }
}
```

## Checklist de Configuração

- [ ] Criar produto "Plano Pro" no Stripe Dashboard
- [ ] Criar preço mensal (R$ 15,90/mês)
- [ ] Criar preço anual (R$ 159,00/ano)
- [ ] Copiar Product ID e Price IDs
- [ ] Atualizar tabela `subscription_plans` com product_id
- [ ] Inserir preços na tabela `subscription_prices`
- [ ] Atualizar `app/pricing/page.tsx` com IDs reais
- [ ] Testar criação de checkout

## Verificar Configuração

Execute no Supabase para ver os preços configurados:

```sql
SELECT
  sp.name,
  sp.display_name,
  sp.stripe_product_id,
  spr.stripe_price_id,
  spr.amount,
  spr.interval
FROM subscription_plans sp
LEFT JOIN subscription_prices spr ON spr.plan_id = sp.id
WHERE sp.name = 'pro';
```

Se retornar vazio ou NULLs, significa que você precisa configurar!

## Links Úteis

- [Stripe Products Dashboard](https://dashboard.stripe.com/test/products)
- [Stripe API Docs - Products](https://stripe.com/docs/api/products)
- [Stripe API Docs - Prices](https://stripe.com/docs/api/prices)
