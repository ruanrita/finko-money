# 📁 Scripts - FinkoMoney

Utilitários e scripts auxiliares para desenvolvimento e manutenção.

## 🔧 Scripts de Configuração

### `create-stripe-products.ts` ⭐ IMPORTANTE
Script automático para criar produtos e preços no Stripe e atualizar o banco.

**Uso:**
```bash
npx tsx scripts/create-stripe-products.ts
```

**Requisitos:**
- `STRIPE_SECRET_KEY` configurado no `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` configurado

**O que faz:**
- ✅ Cria produto "Plano Pro" no Stripe
- ✅ Cria preços mensal (R$ 15,90) e anual (R$ 159,00)
- ✅ Atualiza tabelas `subscription_plans` e `subscription_prices`

---

## 🧪 Scripts de Teste

### `test-webhook.bat` (Windows) ⭐ IMPORTANTE
### `test-webhook.sh` (Linux/Mac) ⭐ IMPORTANTE

Scripts para facilitar teste de webhooks do Stripe localmente.

**Uso:**
```bash
# Windows
scripts\test-webhook.bat

# Linux/Mac
bash scripts/test-webhook.sh
```

**O que faz:**
- Verifica se Stripe CLI está instalado
- Verifica se servidor Next.js está rodando
- Inicia `stripe listen` para forward de webhooks
- Mostra instruções de como testar

---

## 🗄️ Scripts SQL

### `check-stripe-config.sql`
Verifica a configuração atual dos produtos e preços do Stripe no banco.

**Uso:**
```bash
docker exec supabase_db_finko-money psql -U postgres -d postgres -f scripts/check-stripe-config.sql
```

**Útil para:**
- Ver se price IDs são placeholders ou IDs reais
- Verificar se produtos estão ativos
- Debug de configuração Stripe

---

### `check-user-subscription.sql`
Mostra informações completas de assinatura de um usuário.

**Uso:**
```bash
# Edite o arquivo e substitua o email
docker exec supabase_db_finko-money psql -U postgres -d postgres -f scripts/check-user-subscription.sql
```

**Mostra:**
- Dados do usuário e plano atual
- Detalhes da assinatura Stripe
- Status e períodos
- Interpretação dos status

---

### `update-stripe-prices.sql`
Atualização manual dos price IDs do Stripe no banco.

**Uso:**
```bash
# 1. Edite o arquivo e cole os IDs reais do Stripe
# 2. Execute:
docker exec supabase_db_finko-money psql -U postgres -d postgres -f scripts/update-stripe-prices.sql
```

**Use quando:**
- O script TypeScript (`create-stripe-products.ts`) falhar
- Você criou os produtos manualmente no Stripe Dashboard
- Precisa atualizar IDs de produção

---

## 🚀 Scripts de Migração

### `migrate.js`
Script para rodar migrations do Supabase em ambientes customizados.

**Uso:**
```bash
npm run supa:migrate
```

**Requisitos:**
- `SUPABASE_DB_URL` configurado no `.env.local`

**Usado por:** `package.json` script `supa:migrate`

---

## 🗂️ Estrutura

```
scripts/
├── README.md                      # Este arquivo
├── create-stripe-products.ts      # ⭐ Criar produtos Stripe (automático)
├── test-webhook.bat               # ⭐ Testar webhooks (Windows)
├── test-webhook.sh                # ⭐ Testar webhooks (Linux/Mac)
├── check-stripe-config.sql        # Verificar config Stripe
├── check-user-subscription.sql    # Ver dados de assinatura
├── update-stripe-prices.sql       # Atualizar price IDs (manual)
└── migrate.js                     # Rodar migrations Supabase
```

---

## 📚 Documentação Relacionada

- [Stripe Setup Quickstart](../docs/STRIPE-SETUP-QUICKSTART.md) - Guia rápido de configuração
- [Webhook Testing Guide](../docs/WEBHOOK-TESTING-GUIDE.md) - Como testar webhooks
- [Webhook Troubleshooting](../docs/WEBHOOK-TROUBLESHOOTING.md) - Resolver problemas

---

## 💡 Dicas

### Primeira Vez Configurando Stripe?
1. Use `create-stripe-products.ts` (automático)
2. Se falhar, siga o guia manual em `docs/STRIPE-SETUP-QUICKSTART.md`
3. Use `update-stripe-prices.sql` como último recurso

### Testando Webhooks?
1. Execute `test-webhook.bat` ou `test-webhook.sh`
2. Copie o webhook secret para `.env.local`
3. Reinicie o servidor
4. Faça um checkout de teste

### Verificando Configuração?
```bash
# Ver se Stripe está configurado
docker exec supabase_db_finko-money psql -U postgres -d postgres -f scripts/check-stripe-config.sql

# Ver assinatura de um usuário (edite o email no arquivo primeiro)
docker exec supabase_db_finko-money psql -U postgres -d postgres -f scripts/check-user-subscription.sql
```

---

**Última atualização:** 2025-11-29
