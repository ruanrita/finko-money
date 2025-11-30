# Integração Stripe - Sistema de Assinaturas FinkoMoney

## 1. Visão Geral

Este documento descreve o fluxo completo de integração com Stripe para implementar um sistema de assinaturas (mensal/anual) com limitações de recursos no FinkoMoney.

### 1.1 Estratégia de Lançamento em Fases

**Fase 1 - Lançamento Inicial (SEM assinaturas)**
- Todos os usuários terão acesso ao sistema com limitações fixas
- Nenhum pagamento será cobrado
- Limitações aplicadas para todos os usuários
- Foco em validar o produto e ganhar tração

**Fase 2 - Introdução de Assinaturas (FUTURO)**
- Usuários antigos (early adopters) **mantêm acesso completo sem pagar** (grandfathering)
- Novos usuários escolhem entre plano Free ou Pro
- Sistema de pagamento via Stripe é ativado
- Usuários antigos podem fazer upgrade para Pro se quiserem mais recursos

⚠️ **IMPORTANTE**: Este documento prepara para a Fase 2, mas a implementação inicial (Fase 1) terá apenas as limitações sem sistema de pagamento.

## 2. Recursos Stripe Necessários

### 2.1 APIs e Produtos Stripe

- **Stripe Products**: Representam os planos (Free, Pro, Premium)
- **Stripe Prices**: Preços associados aos produtos (mensal/anual)
- **Stripe Subscriptions**: Gerenciamento de assinaturas dos usuários
- **Stripe Checkout**: Interface de pagamento hosted
- **Stripe Customer Portal**: Portal para usuários gerenciarem assinaturas
- **Stripe Webhooks**: Eventos de pagamento, cancelamento, etc.

### 2.2 Bibliotecas

```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

## 3. Estrutura de Planos

### 3.1 Definição de Planos

#### Fase 1 - Lançamento Inicial (Todos os usuários)
Limitações aplicadas para todos os usuários cadastrados:
- ✅ 50 transações/mês
- ✅ 5 categorias customizadas
- ✅ 3 metas financeiras
- ✅ 3 orçamentos
- ✅ Relatórios inclusos
- ✅ Exportação CSV/PDF/Excel
- ✅ Suporte via email
- ✅ Histórico de 2 anos

#### Fase 2 - Com Sistema de Assinaturas

| Recurso | Early Adopters* | Free | Pro |
|---------|----------------|------|-----|
| **Preço** | Grátis (vitalício) | R$ 0/mês | R$ 15,90/mês |
| Transações/mês | 50 | 50 | 300 |
| Categorias customizadas | 5 | 5 | 20 |
| Metas financeiras | 3 | 3 | 15 |
| Orçamentos | 3 | 3 | 10 |
| Equipe (membros) | 4 extras | 2 | 10 |
| Branches próprias | 3 | 2 | 5 |
| Lembretes (via email) | 6 | 3 | 15 |
| Relatórios | ✅ | ✅ | ✅ Avançados |
| Exportação | CSV/PDF/Excel | CSV | CSV/PDF/Excel |
| Suporte | Email | Email | Email |
| Histórico | 2 anos | 6 meses | 3 anos |

\* *Early Adopters = Usuários cadastrados antes da ativação do sistema de assinaturas*

### 3.2 Preços

- **Early Adopters**: R$ 0,00 (grandfathering vitalício)
- **Free**: R$ 0,00/mês
- **Pro**: R$ 15,90/mês ou R$ 159,00/ano (economize 2 meses)

> 💡 **Plano Premium**: Será implementado no futuro conforme demanda dos usuários.

> ⚙️ **Sistema de Gerenciamento**: O sistema será capaz de alterar dinamicamente os planos e suas limitações através do banco de dados, sem necessidade de deploy de código.

## 4. Schema do Banco de Dados

### 4.1 Tabela `subscription_plans`

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL, -- 'free', 'pro', 'premium'
  display_name VARCHAR(100) NOT NULL,
  stripe_product_id VARCHAR(100),
  max_transactions INTEGER,
  max_categories INTEGER,
  max_goals INTEGER,
  max_budgets INTEGER,
  max_team_members INTEGER, -- membros da equipe
  max_branches INTEGER, -- branches próprias
  max_reminders INTEGER, -- lembretes via email
  has_advanced_reports BOOLEAN DEFAULT false,
  export_formats TEXT[], -- ['csv', 'pdf', 'excel']
  support_level VARCHAR(50), -- 'email', 'email_chat', 'priority'
  history_months INTEGER, -- null = unlimited
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Tabela `subscription_prices`

```sql
CREATE TABLE subscription_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_price_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  interval VARCHAR(20) NOT NULL, -- 'month' ou 'year'
  interval_count INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Atualização Tabela `users`

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50); -- 'active', 'canceled', 'past_due', 'trialing', 'grandfathered'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_early_adopter BOOLEAN DEFAULT false; -- TRUE para usuários antes do sistema de assinaturas
ALTER TABLE users ADD COLUMN IF NOT EXISTS early_adopter_registered_at TIMESTAMP; -- Data de cadastro como early adopter
```

### 4.4 Tabela `user_subscriptions`

```sql
CREATE TABLE user_subscriptions (
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
```

### 4.5 Tabela `usage_tracking`

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- 'transaction', 'bank_account', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start, period_end)
);
```

## 5. Implementação - FASE 1 (Lançamento Inicial)

### 5.1 Migration - Setup Inicial

Esta migration cria o plano padrão para a Fase 1 e configura todos os usuários existentes e futuros:

```sql
-- 1. Criar tabela de planos
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  stripe_product_id VARCHAR(100),
  max_transactions INTEGER,
  max_categories INTEGER,
  max_goals INTEGER,
  max_budgets INTEGER,
  max_team_members INTEGER,
  max_branches INTEGER,
  max_reminders INTEGER,
  has_advanced_reports BOOLEAN DEFAULT false,
  export_formats TEXT[],
  support_level VARCHAR(50),
  history_months INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir plano inicial (Fase 1 - para todos os usuários)
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
);

-- 3. Adicionar colunas necessárias na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_early_adopter BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS early_adopter_registered_at TIMESTAMP;

-- 4. Atribuir plano inicial a todos os usuários existentes
UPDATE users
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'initial_launch')
WHERE subscription_plan_id IS NULL;

-- 5. Criar trigger para novos usuários (Fase 1)
CREATE OR REPLACE FUNCTION assign_initial_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Durante Fase 1, todos ganham o plano inicial
  IF NEW.subscription_plan_id IS NULL THEN
    NEW.subscription_plan_id := (SELECT id FROM subscription_plans WHERE name = 'initial_launch' LIMIT 1);
    NEW.subscription_status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_initial_plan
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_initial_plan();
```

### 5.2 Sistema de Verificação de Limites (Fase 1)

```typescript
// src/modules/usage/usage.service.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

export class UsageService {
  /**
   * Verifica se usuário pode criar um novo recurso baseado no plano dele
   */
  async checkUsageLimit(
    userId: string,
    resourceType: 'transaction' | 'category' | 'goal' | 'budget' | 'team_member' | 'branch' | 'reminder'
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number | null;
    planName: string;
  }> {
    // 1. Buscar plano do usuário
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        subscription_plan_id,
        is_early_adopter,
        subscription_plans (
          name,
          display_name,
          max_transactions,
          max_categories,
          max_goals,
          max_budgets,
          max_team_members,
          max_branches,
          max_reminders
        )
      `)
      .eq('id', userId)
      .single();

    if (!user?.subscription_plans) {
      throw new Error('Plano não encontrado');
    }

    const plan = user.subscription_plans as any;

    // 2. Mapear limite baseado no tipo de recurso
    const limitMap: Record<string, number | null> = {
      transaction: plan.max_transactions,
      category: plan.max_categories,
      goal: plan.max_goals,
      budget: plan.max_budgets,
      team_member: plan.max_team_members,
      branch: plan.max_branches,
      reminder: plan.max_reminders,
    };

    const limit = limitMap[resourceType];

    // null = ilimitado
    if (limit === null) {
      return {
        allowed: true,
        current: 0,
        limit: null,
        planName: plan.display_name,
      };
    }

    // 3. Contar uso atual
    const current = await this.getCurrentUsage(userId, resourceType);

    // 4. Verificar se pode criar
    const allowed = current < limit;

    return {
      allowed,
      current,
      limit,
      planName: plan.display_name,
    };
  }

  /**
   * Conta quantos recursos o usuário já usou no período
   */
  private async getCurrentUsage(
    userId: string,
    resourceType: string
  ): Promise<number> {
    const tableName = this.getTableName(resourceType);

    // Para transações, contar apenas do mês atual
    if (resourceType === 'transaction') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      return count || 0;
    }

    // Para outros recursos, contar total
    const { count } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  private getTableName(resourceType: string): string {
    const tableMap: Record<string, string> = {
      transaction: 'transactions',
      category: 'categories',
      goal: 'goals',
      budget: 'budgets',
      team_member: 'team_members',
      branch: 'branches',
      reminder: 'reminders',
    };
    return tableMap[resourceType];
  }

  /**
   * Verifica se usuário tem acesso a feature específica
   */
  async hasFeatureAccess(
    userId: string,
    feature: 'advanced_reports' | 'export_csv' | 'export_pdf' | 'export_excel'
  ): Promise<boolean> {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        subscription_plans (
          has_advanced_reports,
          export_formats
        )
      `)
      .eq('id', userId)
      .single();

    const plan = user?.subscription_plans as any;

    if (!plan) return false;

    // Verificar feature
    if (feature === 'advanced_reports') {
      return plan.has_advanced_reports;
    }

    // Verificar exportação
    const exportMap: Record<string, string> = {
      export_csv: 'csv',
      export_pdf: 'pdf',
      export_excel: 'excel',
    };

    const format = exportMap[feature];
    return plan.export_formats?.includes(format) || false;
  }
}
```

### 5.3 API Route - Verificar Limite

```typescript
// app/api/usage/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UsageService } from '@/src/modules/usage/usage.service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as any;

  if (!type || !['transaction', 'category', 'goal', 'budget', 'team_member', 'branch', 'reminder'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const usageService = new UsageService();
  const result = await usageService.checkUsageLimit(user.id, type);

  return NextResponse.json(result);
}
```

## 6. Implementação - FASE 2 (Sistema de Assinaturas)

### 6.1 Migration - Ativar Sistema de Assinaturas

Quando for hora de ativar o sistema de assinaturas:

```sql
-- 1. Marcar todos os usuários atuais como Early Adopters
UPDATE users
SET
  is_early_adopter = true,
  early_adopter_registered_at = created_at,
  subscription_status = 'grandfathered'
WHERE is_early_adopter = false;

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
  'pro', 'Plano Pro', 'prod_XXXXXXXXX', -- ID do Stripe
  300, 20, 15, 10,
  10, 5, 15,
  true, ARRAY['csv', 'pdf', 'excel'], 'email', 36
);

-- 3. Atualizar trigger para novos usuários (Fase 2)
CREATE OR REPLACE FUNCTION assign_initial_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Durante Fase 2, novos usuários ganham plano Free
  IF NEW.subscription_plan_id IS NULL THEN
    NEW.subscription_plan_id := (SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1);
    NEW.subscription_status := 'active';
    NEW.is_early_adopter := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Desativar plano inicial (não aparecerá mais na seleção)
UPDATE subscription_plans SET is_active = false WHERE name = 'initial_launch';
```

### 6.2 Configuração Stripe

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

### 5.2 Serviço de Assinaturas

```typescript
// src/modules/subscription/subscription.service.ts
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export class SubscriptionService {
  // Criar/obter customer do Stripe
  async getOrCreateStripeCustomer(userId: string, email: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (user?.stripe_customer_id) {
      return user.stripe_customer_id;
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  }

  // Criar sessão de checkout
  async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const customerId = await this.getOrCreateStripeCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
      subscription_data: {
        trial_period_days: 7, // 7 dias de trial
        metadata: { userId },
      },
    });

    return session;
  }

  // Criar portal do cliente
  async createCustomerPortal(userId: string, returnUrl: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user?.stripe_customer_id) {
      throw new Error('Customer not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: returnUrl,
    });

    return session;
  }

  // Verificar limite de uso
  async checkUsageLimit(
    userId: string,
    resourceType: string
  ): Promise<{ allowed: boolean; current: number; limit: number | null }> {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        subscription_plan_id,
        subscription_plans (
          max_transactions,
          max_categories,
          max_goals,
          max_budgets,
          max_team_members,
          max_branches,
          max_reminders
        )
      `)
      .eq('id', userId)
      .single();

    const plan = user?.subscription_plans as any;

    // Mapeamento de limites
    const limitMap: Record<string, number | null> = {
      transaction: plan?.max_transactions,
      category: plan?.max_categories,
      goal: plan?.max_goals,
      budget: plan?.max_budgets,
      team_member: plan?.max_team_members,
      branch: plan?.max_branches,
      reminder: plan?.max_reminders,
    };

    const limit = limitMap[resourceType];

    // null = ilimitado
    if (limit === null) {
      return { allowed: true, current: 0, limit: null };
    }

    // Buscar uso atual do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from(this.getTableName(resourceType))
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    const current = count || 0;
    const allowed = current < limit;

    return { allowed, current, limit };
  }

  private getTableName(resourceType: string): string {
    const tableMap: Record<string, string> = {
      transaction: 'transactions',
      category: 'categories',
      goal: 'goals',
      budget: 'budgets',
      team_member: 'team_members',
      branch: 'branches',
      reminder: 'reminders',
    };
    return tableMap[resourceType] || resourceType;
  }
}
```

### 5.3 Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Retornar para plano Free
  const { data: freePlan } = await supabaseAdmin
    .from('subscription_plans')
    .select('id')
    .eq('name', 'free')
    .single();

  await supabaseAdmin
    .from('users')
    .update({
      subscription_plan_id: freePlan?.id,
      subscription_status: 'canceled',
      subscription_current_period_end: null,
    })
    .eq('id', userId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Atualizar status de pagamento, enviar email de confirmação, etc.
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Notificar usuário sobre falha no pagamento
  console.log('Payment failed:', invoice.id);
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0].price.id;

  // Buscar plano correspondente
  const { data: price } = await supabaseAdmin
    .from('subscription_prices')
    .select('plan_id')
    .eq('stripe_price_id', priceId)
    .single();

  await supabaseAdmin.from('users').update({
    subscription_plan_id: price?.plan_id,
    subscription_status: subscription.status,
    subscription_current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  }).eq('id', userId);

  // Atualizar tabela user_subscriptions
  await supabaseAdmin.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan_id: price?.plan_id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'stripe_subscription_id'
  });
}
```

## 6. Implementação Frontend

### 6.1 Página de Planos

```typescript
// app/pricing/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  const plans = [
    {
      name: 'Free',
      price: { month: 0, year: 0 },
      priceId: { month: null, year: null },
      features: [
        '50 transações/mês',
        '5 categorias customizadas',
        '3 metas financeiras',
        '3 orçamentos',
        '2 membros na equipe',
        '2 branches próprias',
        '3 lembretes via email',
        'Exportação CSV',
      ],
    },
    {
      name: 'Pro',
      price: { month: 15.90, year: 159 },
      priceId: {
        month: 'price_pro_monthly',
        year: 'price_pro_yearly'
      },
      features: [
        '300 transações/mês',
        '20 categorias customizadas',
        '15 metas financeiras',
        '10 orçamentos',
        '10 membros na equipe',
        '5 branches próprias',
        '15 lembretes via email',
        'Relatórios avançados',
        'Exportação CSV/PDF/Excel',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: { month: 59.90, year: 599 },
      priceId: {
        month: 'price_premium_monthly',
        year: 'price_premium_yearly'
      },
      features: [
        'Transações ilimitadas',
        'Contas ilimitadas',
        'Categorias ilimitadas',
        'Metas ilimitadas',
        'Orçamentos ilimitados',
        'Relatórios avançados',
        'Exportação CSV/PDF/Excel',
        'Suporte prioritário',
      ],
    },
  ];

  async function handleSubscribe(priceId: string | null) {
    if (!priceId) return;

    const response = await fetch('/api/subscription/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await response.json();
    window.location.href = url;
  }

  return (
    <div className="container mx-auto py-12">
      {/* Toggle Month/Year */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border p-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-4 py-2 rounded ${
              interval === 'month' ? 'bg-brand text-white' : ''
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-4 py-2 rounded ${
              interval === 'year' ? 'bg-brand text-white' : ''
            }`}
          >
            Anual (2 meses grátis)
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-lg p-6 ${
              plan.popular ? 'border-brand shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="text-brand text-sm font-semibold mb-2">
                Mais Popular
              </div>
            )}
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold">
                R$ {plan.price[interval].toFixed(2)}
              </span>
              <span className="text-gray-600">
                /{interval === 'month' ? 'mês' : 'ano'}
              </span>
            </div>
            <Button
              onClick={() => handleSubscribe(plan.priceId[interval])}
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              disabled={!plan.priceId[interval]}
            >
              {plan.name === 'Free' ? 'Plano Atual' : 'Assinar'}
            </Button>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.2 API Route - Criar Checkout

```typescript
// app/api/subscription/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/src/modules/subscription/subscription.service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  const subscriptionService = new SubscriptionService();

  const session = await subscriptionService.createCheckoutSession(
    user.id,
    user.email!,
    priceId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`
  );

  return NextResponse.json({ url: session.url });
}
```

### 6.3 API Route - Portal do Cliente

```typescript
// app/api/subscription/customer-portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/src/modules/subscription/subscription.service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscriptionService = new SubscriptionService();

  const session = await subscriptionService.createCustomerPortal(
    user.id,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
  );

  return NextResponse.json({ url: session.url });
}
```

## 7. Middleware de Limitação

### 7.1 Hook de Verificação de Limite

```typescript
// src/hooks/useUsageLimit.ts
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useUsageLimit(resourceType: string) {
  const [usageInfo, setUsageInfo] = useState<{
    allowed: boolean;
    current: number;
    limit: number | null;
  } | null>(null);

  useEffect(() => {
    checkUsage();
  }, [resourceType]);

  async function checkUsage() {
    const response = await fetch(`/api/usage/check?type=${resourceType}`);
    const data = await response.json();
    setUsageInfo(data);
  }

  function canCreate(): boolean {
    if (!usageInfo) return true;

    if (!usageInfo.allowed) {
      toast.error('Limite atingido', {
        description: `Você atingiu o limite de ${usageInfo.limit} ${resourceType}s do seu plano. Faça upgrade para continuar.`,
        action: {
          label: 'Ver Planos',
          onClick: () => window.location.href = '/pricing',
        },
      });
      return false;
    }

    // Avisar quando próximo do limite
    if (usageInfo.limit && usageInfo.current >= usageInfo.limit * 0.8) {
      toast.warning('Próximo do limite', {
        description: `Você está usando ${usageInfo.current} de ${usageInfo.limit} ${resourceType}s disponíveis.`,
      });
    }

    return true;
  }

  return { usageInfo, canCreate, checkUsage };
}
```

### 7.2 Uso no Componente

```typescript
// Exemplo em um componente de transação
'use client';

import { useUsageLimit } from '@/src/hooks/useUsageLimit';

export function TransactionForm() {
  const { canCreate, usageInfo } = useUsageLimit('transaction');

  async function handleSubmit(data: TransactionData) {
    if (!canCreate()) {
      return; // Bloqueado pelo limite
    }

    // Prosseguir com criação
    await createTransaction(data);
  }

  return (
    <div>
      {usageInfo && usageInfo.limit && (
        <div className="mb-4 text-sm text-gray-600">
          {usageInfo.current} de {usageInfo.limit} transações este mês
        </div>
      )}
      {/* Form fields */}
    </div>
  );
}
```

## 8. Variáveis de Ambiente

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 9. Fluxo de Implementação

### Fase 1: Setup Inicial (1-2 dias)
1. Criar conta Stripe e configurar produtos/preços
2. Instalar dependências
3. Criar schema do banco de dados
4. Popular planos iniciais

### Fase 2: Backend (2-3 dias)
1. Implementar SubscriptionService
2. Criar webhooks handler
3. Criar API routes (checkout, portal)
4. Implementar sistema de verificação de limites

### Fase 3: Frontend (2-3 dias)
1. Criar página de pricing
2. Criar componente de plano atual no dashboard
3. Implementar hook useUsageLimit
4. Adicionar indicadores de uso nos componentes

### Fase 4: Testes (1-2 dias)
1. Testar fluxo completo de assinatura
2. Testar webhooks (usar Stripe CLI)
3. Testar limitações de recursos
4. Testar upgrade/downgrade de planos

### Fase 5: Produção (1 dia)
1. Criar produtos no Stripe production
2. Configurar webhook em produção
3. Migrar usuários existentes para plano Free
4. Deploy e monitoramento

## 10. Pontos de Atenção

### 10.1 Segurança
- Sempre validar webhooks com assinatura
- Nunca expor STRIPE_SECRET_KEY no frontend
- Validar limites no backend, não confiar apenas no frontend

### 10.2 UX
- Avisar usuário quando próximo do limite
- Oferecer upgrade fácil quando limite atingido
- Trial period de 7 dias para novos assinantes
- Cancelamento gracioso (manter até fim do período pago)

### 10.3 Monitoramento
- Logs de todos os webhooks
- Alertas para pagamentos falhados
- Dashboard de métricas de assinatura (MRR, churn, etc.)

### 10.4 Compliance
- Termos de uso e política de privacidade
- LGPD: direito de exclusão de dados
- Notas fiscais (integrar com sistema de emissão)

## 11. Recursos Adicionais

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
