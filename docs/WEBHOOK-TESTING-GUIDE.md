# 🔔 Guia de Teste de Webhooks - Stripe

## 📋 Visão Geral

Este guia mostra como testar o fluxo completo de webhooks do Stripe localmente.

### Fluxo que vamos testar:

1. **Usuário clica em "Assinar"** → Cria checkout session
2. **Stripe Checkout** → Usuário paga com cartão de teste
3. **Webhook: checkout.session.completed** → Sistema cria assinatura
4. **Webhook: customer.subscription.created** → Sistema atualiza plano do usuário
5. **Webhook: invoice.payment_succeeded** → Pagamento confirmado
6. **Usuário é redirecionado** → Dashboard com plano Pro ativado

---

## 🚀 Passo 1: Instalar Stripe CLI

### Windows (usando Scoop):
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Windows (Manual):
1. Baixe: https://github.com/stripe/stripe-cli/releases/latest
2. Extraia `stripe.exe` para uma pasta no PATH
3. Verifique: `stripe --version`

### macOS/Linux:
```bash
brew install stripe/stripe-cli/stripe
```

---

## 🔧 Passo 2: Fazer Login no Stripe CLI

```bash
stripe login
```

Isso vai:
- Abrir o browser
- Pedir para você autorizar
- Conectar o CLI à sua conta Stripe

---

## 🎧 Passo 3: Iniciar o Listener de Webhooks

**Terminal 1 - Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Você verá algo como:
```
> Ready! You are using Stripe API Version [2024-11-20]. Your webhook signing secret is whsec_abc123...
```

**⚠️ IMPORTANTE: Copie o webhook secret (whsec_...)!**

---

## ⚙️ Passo 4: Configurar o Webhook Secret

Adicione ao `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_SEU_SECRET_AQUI
```

**Reinicie o servidor Next.js:**
```bash
# Terminal 2
npm run dev
```

---

## 🧪 Passo 5: Testar o Fluxo Completo

### 5.1 Preparar o Teste

1. **Crie um usuário de teste** (se não tiver):
   - Acesse: http://localhost:3000/signup
   - Email: test@example.com
   - Senha: qualquer123

2. **Verifique o plano atual** (deve ser Free ou Initial Launch):
   ```bash
   docker exec supabase_db_finko-money psql -U postgres -d postgres -c "
     SELECT email, subscription_status,
            (SELECT name FROM subscription_plans WHERE id = users.subscription_plan_id) as plan
     FROM users
     WHERE email = 'test@example.com';
   "
   ```

### 5.2 Iniciar Checkout

1. **Acesse a página de pricing:**
   - http://localhost:3000/pricing

2. **Clique em "Assinar"** no Plano Pro

3. **Verifique o Terminal 1 (Stripe CLI):**
   ```
   [200] POST /api/webhooks/stripe [evt_xxx] checkout.session.created
   ```

4. **Você será redirecionado para o Stripe Checkout**

### 5.3 Preencher o Checkout

Use os **cartões de teste do Stripe:**

**Cartão de Sucesso:**
- Número: `4242 4242 4242 4242`
- CVV: `123` (qualquer)
- Validade: `12/34` (qualquer futuro)
- Nome: Teste
- Email: test@example.com

**Clique em "Subscribe"**

### 5.4 Observar os Webhooks

**Terminal 1 (Stripe CLI) - Você verá:**
```
[200] POST /api/webhooks/stripe [evt_1] checkout.session.completed
[200] POST /api/webhooks/stripe [evt_2] customer.subscription.created
[200] POST /api/webhooks/stripe [evt_3] invoice.created
[200] POST /api/webhooks/stripe [evt_4] invoice.finalized
[200] POST /api/webhooks/stripe [evt_5] invoice.paid
[200] POST /api/webhooks/stripe [evt_6] invoice.payment_succeeded
[200] POST /api/webhooks/stripe [evt_7] payment_intent.created
[200] POST /api/webhooks/stripe [evt_8] payment_intent.succeeded
```

**Terminal 2 (Next.js) - Você verá:**
```
✅ Webhook received: checkout.session.completed
✅ User subscription updated: user-abc-123
✅ Webhook received: customer.subscription.created
✅ User subscription updated: user-abc-123
✅ Webhook received: invoice.payment_succeeded
✅ Payment succeeded: in_abc123
```

### 5.5 Verificar no Banco de Dados

```bash
docker exec supabase_db_finko-money psql -U postgres -d postgres -c "
  SELECT
    u.email,
    u.subscription_status,
    sp.name AS plan_name,
    sp.display_name,
    us.stripe_subscription_id,
    us.current_period_end
  FROM users u
  JOIN subscription_plans sp ON sp.id = u.subscription_plan_id
  LEFT JOIN user_subscriptions us ON us.user_id = u.id
  WHERE u.email = 'test@example.com';
"
```

**Esperado:**
```
email              | subscription_status | plan_name | display_name | stripe_subscription_id | current_period_end
-------------------|---------------------|-----------|--------------|------------------------|--------------------
test@example.com   | active              | pro       | Plano Pro    | sub_abc123             | 2025-12-29 ...
```

### 5.6 Verificar no Dashboard

1. **Seja redirecionado para:** http://localhost:3000/dashboard?checkout=success
2. **Acesse:** http://localhost:3000/configuracoes/plano
3. **Você deve ver:** Plano Pro ativo

---

## 🐛 Troubleshooting

### ❌ Erro: "Webhook signature verification failed"

**Causa:** STRIPE_WEBHOOK_SECRET incorreto ou não configurado.

**Solução:**
1. Copie o secret do `stripe listen` (começa com `whsec_`)
2. Adicione ao `.env.local`
3. Reinicie o servidor (`npm run dev`)

### ❌ Webhooks não aparecem no Terminal

**Causa:** Stripe CLI não está rodando ou a porta está errada.

**Solução:**
```bash
# Verifique se o servidor está em 3000
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Se estiver em outra porta (ex: 3001):
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

### ❌ User subscription não atualiza

**Causa:** userId não está no metadata da checkout session.

**Solução:** Verifique o código em `app/api/subscription/create-checkout/route.ts`:
```typescript
const session = await subscriptionService.createCheckoutSession(
  user.id,  // ✅ userId deve estar aqui
  user.email!,
  priceId,
  successUrl,
  cancelUrl
);
```

### ❌ Price not found no webhook

**Causa:** Price ID do Stripe não está no banco.

**Solução:**
```bash
# Verificar prices no banco
docker exec supabase_db_finko-money psql -U postgres -d postgres -c "
  SELECT stripe_price_id, amount, interval
  FROM subscription_prices
  WHERE active = true;
"

# Deve mostrar IDs reais do Stripe (price_...)
```

---

## 🧪 Testar Outros Cenários

### Teste 2: Cancelamento de Assinatura

1. **Acesse o Customer Portal:**
   ```bash
   # No código, adicione um botão:
   const response = await fetch('/api/subscription/customer-portal', { method: 'POST' });
   const { url } = await response.json();
   window.location.href = url;
   ```

2. **Cancele a assinatura**

3. **Observe o webhook:**
   ```
   [200] POST /api/webhooks/stripe customer.subscription.deleted
   ```

4. **Verifique o banco:**
   - subscription_status → 'canceled'
   - subscription_plan_id → volta para 'free'

### Teste 3: Pagamento Falhou

```bash
# Simular evento manualmente
stripe trigger invoice.payment_failed
```

Observe:
- subscription_status → 'past_due'
- Logs mostram usuário notificado

### Teste 4: Trial Period

Se você configurou trial (7 dias grátis):

1. Crie uma nova assinatura
2. Verifique `subscription_status` → 'trialing'
3. Após 7 dias (ou simule com trigger):
   ```bash
   stripe trigger customer.subscription.trial_will_end
   ```

---

## 📊 Eventos do Stripe

### Eventos Principais:

| Evento | Quando Dispara | O que Fazer |
|--------|---------------|-------------|
| `checkout.session.completed` | Checkout finalizado | Criar assinatura |
| `customer.subscription.created` | Nova assinatura | Atualizar plano do usuário |
| `customer.subscription.updated` | Mudança no plano/status | Atualizar status |
| `customer.subscription.deleted` | Cancelamento | Voltar para Free |
| `invoice.payment_succeeded` | Pagamento OK | Log/Email confirmação |
| `invoice.payment_failed` | Pagamento falhou | Marcar past_due/Notificar |

### Ver Todos os Eventos:

```bash
stripe events list --limit 20
```

### Reenviar um Evento Específico:

```bash
# Se um webhook falhou, reenvie:
stripe events resend evt_abc123
```

---

## 🚀 Próximos Passos

### Para Produção:

1. **Configurar Webhook Endpoint Real:**
   - Dashboard Stripe → Webhooks
   - Add endpoint: `https://seuapp.com/api/webhooks/stripe`
   - Selecionar eventos necessários
   - Copiar o signing secret

2. **Atualizar Environment Variables:**
   ```env
   STRIPE_SECRET_KEY=sk_live_...  # Chave LIVE
   STRIPE_WEBHOOK_SECRET=whsec_... # Secret do webhook de produção
   ```

3. **Testar em Produção:**
   - Criar assinatura real
   - Monitorar logs de webhooks
   - Verificar se atualiza corretamente

---

## 📚 Recursos

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Eventos do Stripe](https://stripe.com/docs/api/events/types)

---

## 🎯 Checklist de Teste

- [ ] Stripe CLI instalado e autenticado
- [ ] `stripe listen` rodando
- [ ] STRIPE_WEBHOOK_SECRET configurado
- [ ] Servidor Next.js rodando
- [ ] Checkout funciona
- [ ] Webhooks aparecem no terminal
- [ ] Banco de dados atualiza (users + user_subscriptions)
- [ ] Usuário vê plano Pro no dashboard
- [ ] Cancelamento funciona
- [ ] Logs mostram eventos claramente

**Se todos os checks ✅, seu sistema de webhooks está funcionando perfeitamente!** 🎉
