# 🔧 Webhook Troubleshooting - Stripe

## Erros Comuns e Soluções

### ✅ Erro Resolvido: "Invalid time value"

**Erro:**
```
❌ Webhook handler error: RangeError: Invalid time value
    at Date.toISOString (<anonymous>)
```

**Causa:** Timestamps do Stripe vieram como `null` ou `undefined`.

**Solução:** ✅ **JÁ CORRIGIDO** - Adicionamos validação robusta de timestamps.

**Como Funciona Agora:**
```typescript
// Converte com segurança, retorna null se inválido
const toISOString = (timestamp: number | null | undefined): string | null => {
  if (!timestamp || isNaN(timestamp)) return null;
  try {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  } catch (error) {
    return null;
  }
};
```

---

## 📊 Interpretando Logs do Webhook

### Logs Normais (Sucesso):

```bash
✅ Webhook received: checkout.session.completed
🔄 Processing checkout completion for user: abc-123
📝 Updating subscription: { userId, subscriptionId, status, ... }
✅ Found price in database: { priceId, planId }
📅 Converted timestamps: { periodStart: '2025-11-29...', periodEnd: '2025-12-29...' }
✅ Updated users table
✅ Updated user_subscriptions table
✅ User subscription fully updated: abc-123
```

### Logs de Erro:

#### ❌ Price ID não encontrado
```bash
❌ Price not found in database: price_xyz123
```

**Solução:**
1. Verifique se o price existe no banco:
   ```sql
   SELECT stripe_price_id, amount, interval
   FROM subscription_prices
   WHERE stripe_price_id = 'price_xyz123';
   ```
2. Se não existir, adicione manualmente ou rode o script de setup.

#### ❌ Timestamp inválido
```bash
⚠️ Invalid timestamp received: null
📅 Converted timestamps: { periodStart: null, periodEnd: null }
```

**Causa:** Normal em alguns estados de assinatura (trial ending, cancelada, etc.).

**Impacto:** Nenhum - O webhook ainda funciona, apenas não define as datas.

#### ❌ Usuário não encontrado
```bash
❌ No userId in subscription metadata
```

**Causa:** Checkout session não incluiu o `userId` no metadata.

**Solução:** Verifique `app/api/subscription/create-checkout/route.ts`:
```typescript
const session = await subscriptionService.createCheckoutSession(
  user.id,  // ✅ Deve passar o user.id aqui
  user.email!,
  priceId,
  successUrl,
  cancelUrl
);
```

---

## 🐛 Debug Avançado

### Ver Dados Completos do Webhook

Adicione temporariamente no webhook handler:

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 🔍 DEBUG: Ver dados completos do evento
  console.log('🔍 FULL EVENT DATA:', JSON.stringify(event, null, 2));

  // ... resto do código
}
```

### Ver Dados da Assinatura

Adicione em `updateUserSubscription`:

```typescript
// 🔍 DEBUG: Ver dados completos da subscription
console.log('🔍 FULL SUBSCRIPTION:', JSON.stringify(subscription, null, 2));
```

### Verificar Webhook Secret

```bash
# Ver o secret configurado
echo $STRIPE_WEBHOOK_SECRET

# Deve começar com whsec_
```

Se não começar com `whsec_`, você usou o secret errado.

---

## 🧪 Testar Webhooks Manualmente

### Reenviar Evento do Stripe

```bash
# Listar eventos recentes
stripe events list --limit 10

# Reenviar um evento específico
stripe events resend evt_abc123
```

### Simular Eventos

```bash
# Simular checkout completo
stripe trigger checkout.session.completed

# Simular assinatura criada
stripe trigger customer.subscription.created

# Simular pagamento falhou
stripe trigger invoice.payment_failed

# Simular cancelamento
stripe trigger customer.subscription.deleted
```

---

## 📋 Checklist de Verificação

Quando um webhook falhar:

- [ ] **Webhook Secret está correto?**
  ```bash
  # Copie do stripe listen
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  # Adicione ao .env.local
  STRIPE_WEBHOOK_SECRET=whsec_...
  # Reinicie o servidor
  ```

- [ ] **Price IDs existem no banco?**
  ```sql
  SELECT stripe_price_id FROM subscription_prices WHERE active = true;
  ```

- [ ] **Metadata do Stripe está correto?**
  - Checkout session tem `metadata.userId`
  - Subscription tem `metadata.userId`

- [ ] **Logs estão sendo mostrados?**
  - Verifique o terminal do Next.js
  - Verifique o terminal do Stripe CLI

- [ ] **Banco de dados está acessível?**
  ```bash
  docker ps | grep supabase
  ```

---

## 🔍 Verificar Status Atual

### Ver assinatura de um usuário:

```bash
docker exec supabase_db_finko-money psql -U postgres -d postgres -c "
  SELECT
    u.email,
    u.subscription_status,
    sp.name AS plan,
    us.stripe_subscription_id,
    us.current_period_end
  FROM users u
  LEFT JOIN subscription_plans sp ON sp.id = u.subscription_plan_id
  LEFT JOIN user_subscriptions us ON us.user_id = u.id
  WHERE u.email = 'seu-email@example.com';
"
```

### Ver últimos webhooks processados:

O Stripe CLI mostra automaticamente, mas você também pode ver no Dashboard:
- https://dashboard.stripe.com/test/webhooks

---

## 🚨 Webhooks em Produção

### Configurar Webhook Endpoint

1. **Dashboard Stripe → Webhooks:**
   - https://dashboard.stripe.com/webhooks

2. **Add endpoint:**
   - URL: `https://seuapp.com/api/webhooks/stripe`

3. **Selecionar eventos:**
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ```

4. **Copiar Signing Secret:**
   - Atualizar `STRIPE_WEBHOOK_SECRET` na produção

### Monitorar Webhooks

- **Stripe Dashboard:** Ver todos os eventos e tentativas
- **Logs do Servidor:** CloudWatch, Vercel Logs, etc.
- **Alertas:** Configure alertas para webhooks com falha

### Retry Policy

O Stripe tenta reenviar webhooks automaticamente:
- **1ª tentativa:** Imediato
- **2ª tentativa:** 1 hora depois
- **3ª tentativa:** 3 horas depois
- Continua por **3 dias**

Se ainda falhar após 3 dias, você precisa corrigir manualmente.

---

## 📚 Recursos

- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Event Types](https://stripe.com/docs/api/events/types)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

## 💡 Dicas

1. **Sempre valide dados do Stripe** - Nunca assuma que um campo existe
2. **Log tudo em desenvolvimento** - Facilita debug
3. **Use try-catch** - Previne crashes do webhook
4. **Retorne 200** - Mesmo em caso de erro lógico, para Stripe não reenviar
5. **Idempotência** - Use `upsert` para evitar duplicatas
6. **Monitore em produção** - Configure alertas para falhas

---

**Se você ainda tiver problemas, verifique os logs detalhados que adicionamos! 📊**
