# ⚡ Guia Rápido - Configuração Stripe

## 🎯 Solução do Erro "No such price"

Você está recebendo esse erro porque os price IDs no banco de dados são placeholders. Você precisa criar os produtos no Stripe e atualizar o banco.

## 🚀 Opção 1: Script Automático (Recomendado - 2 minutos)

### Passo 1: Obter chaves do Stripe

1. Acesse https://dashboard.stripe.com/test/apikeys
2. Copie a **Secret key** (começa com `sk_test_`)
3. Copie a **Publishable key** (começa com `pk_test_`)

### Passo 2: Configurar .env.local

Edite o arquivo `.env.local` e adicione (ou atualize):

```env
STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SEU_PUBLISHABLE_KEY_AQUI
```

### Passo 3: Executar o script

```bash
npx tsx scripts/create-stripe-products.ts
```

Esse script vai:
- ✅ Criar o produto "Plano Pro" no Stripe
- ✅ Criar o preço mensal (R$ 15,90/mês)
- ✅ Criar o preço anual (R$ 159,00/ano)
- ✅ Atualizar o banco de dados automaticamente

**Pronto! Agora você pode testar o checkout.**

---

## 🔧 Opção 2: Manual (5 minutos)

### Passo 1: Criar Produto no Stripe Dashboard

1. Acesse https://dashboard.stripe.com/test/products
2. Clique em **"Create product"**
3. Preencha:
   - **Name**: `Plano Pro - FinkoMoney`
   - **Description**: `Plano profissional com recursos avançados`

### Passo 2: Adicionar Preços

Ainda na criação do produto:

**Preço Mensal:**
- **Price**: `15.90`
- **Currency**: `BRL`
- **Billing period**: `Monthly`

Clique em **"Add another price"**

**Preço Anual:**
- **Price**: `159.00`
- **Currency**: `BRL`
- **Billing period**: `Yearly`

Clique em **"Save product"**

### Passo 3: Copiar IDs

Você verá algo assim:

```
Product ID: prod_RaBcDeFgHiJkLm

Prices:
  Monthly: price_AbCdEfGhIjKlMn (R$15.90/month)
  Yearly: price_XyZaBcDeFgHiJk (R$159.00/year)
```

### Passo 4: Atualizar Banco de Dados

Execute esses SQLs no Supabase substituindo pelos IDs reais:

```sql
-- 1. Atualizar produto
UPDATE subscription_plans
SET stripe_product_id = 'prod_RaBcDeFgHiJkLm'  -- ⚠️ Cole seu Product ID aqui
WHERE name = 'pro';

-- 2. Atualizar preço mensal
UPDATE subscription_prices
SET stripe_price_id = 'price_AbCdEfGhIjKlMn'  -- ⚠️ Cole seu Price ID mensal
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
  AND interval = 'month';

-- 3. Atualizar preço anual
UPDATE subscription_prices
SET stripe_price_id = 'price_XyZaBcDeFgHiJk'  -- ⚠️ Cole seu Price ID anual
WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
  AND interval = 'year';
```

### Passo 5: Verificar

```bash
# Via docker (se estiver rodando localmente)
docker exec supabase_db_finko-money psql -U postgres -d postgres -c "
  SELECT sp.name, spr.stripe_price_id, spr.amount, spr.interval
  FROM subscription_plans sp
  JOIN subscription_prices spr ON spr.plan_id = sp.id
  WHERE sp.name = 'pro';
"
```

Você deve ver os IDs reais do Stripe (começando com `price_`).

---

## ✅ Testar o Checkout

1. Inicie o app: `npm run dev`
2. Acesse: http://localhost:3000/pricing
3. Clique em **"Assinar"** no plano Pro
4. Você deve ser redirecionado para o Stripe Checkout

### Cartões de Teste do Stripe

Use esses números para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

**CVV**: Qualquer 3 dígitos
**Validade**: Qualquer data futura
**CEP**: Qualquer 5 dígitos

---

## 🐛 Troubleshooting

### Erro: "No such price: 'price_pro_monthly'"

**Causa**: O banco ainda tem o placeholder.
**Solução**: Execute o script automático OU atualize o banco manualmente.

### Erro: "Invalid API Key"

**Causa**: STRIPE_SECRET_KEY não está configurada ou está incorreta.
**Solução**: Verifique `.env.local` e recarregue o servidor (`npm run dev`).

### Erro: "Could not find or load subscription_prices"

**Causa**: Migration não foi executada.
**Solução**: Execute `npx supabase db reset`

### Checkout não carrega

1. Verifique o console do browser (F12)
2. Verifique os logs do servidor
3. Certifique-se de que:
   - Stripe keys estão corretas
   - Price IDs existem no Stripe
   - Price IDs no banco correspondem aos do Stripe

---

## 📚 Próximos Passos

Depois de configurar o Stripe:

1. **Configure Webhooks** (para sincronizar pagamentos):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Teste o fluxo completo**:
   - Criar assinatura
   - Webhook de checkout.session.completed
   - Atualização do plano do usuário
   - Cancelamento de assinatura

3. **Production**:
   - Criar produtos no modo **Live** (não Test)
   - Configurar webhook em produção
   - Atualizar environment variables de produção

---

## 🔗 Links Úteis

- [Stripe Dashboard (Test)](https://dashboard.stripe.com/test/dashboard)
- [Stripe Products](https://dashboard.stripe.com/test/products)
- [Stripe API Keys](https://dashboard.stripe.com/test/apikeys)
- [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
