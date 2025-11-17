# 🧩 SaaS de Gestão Pessoal — Infraestrutura & Tecnologias

Este documento descreve toda a arquitetura utilizada para construir um SaaS de gestão pessoal, moderno, escalável e barato, usando um stack 100% serverless.

---

## 📦 Tecnologias

### 🖥️ Frontend

- **Next.js**
- Deploy em **Netlify**
- **SSR/SSG/ISR** funcionando nativamente
- Roteamento padrão do Next
- Otimizado para Edge

### 🧠 Backend

O backend é dividido em 2 camadas:

1. **Netlify Functions** (APIs da aplicação)
   - Usadas para:
     - Endpoints REST do app
     - Validação de dados
     - Consumo de APIs externas
     - Webhooks (Stripe, Resend, etc.)
     - Cron jobs leves

2. **Supabase Edge Functions** (Lógica do domínio)
   - Usadas para:
     - Operações sensíveis de banco
     - Cálculos
     - Workflows internos
     - Cron jobs importantes (como billing, limpeza, métricas)

**Motivo da separação:**
- **Netlify:** serve para rotas de API externas/públicas
- **Supabase:** lógica crítica, próxima ao banco

---

### 🗄️ Banco de Dados

- **PostgreSQL** gerenciado pelo Supabase
- Migrations com *supabase migrations*
- Row Level Security (RLS) habilitado
- Policies para cada tabela

**Tabelas recomendadas:**
- users
- accounts
- transactions
- budgets
- categories
- goals
- recurring_tasks
- app_settings
- audit_logs

---

### 🔐 Autenticação

- Fornecida pelo **Supabase Auth**:
  - Email + senha
  - OAuth (Google)
  - Magic Link
  - Tokens JWT assinados no Edge
- O Next.js usa o pacote:
  `@supabase/auth-helpers-nextjs`

---

### 💳 Pagamento & Billing

- **Stripe** (Checkout + Portal de Billing)
- Webhooks recebem eventos via Netlify Functions
- Controle de planos dentro do Supabase (tabela `subscriptions`)

**Fluxo:**
1. Usuário cria conta
2. Vai para Stripe Checkout
3. Webhook grava/atualiza assinatura no Supabase
4. Recursos liberados conforme o plano

---

### 📧 Envio de Emails

- **Resend**
- Templates em React
- Usado para:
  - Onboarding
  - Emails de resumo
  - Recuperação de senha (caso queira customizar)
  - Relatórios

---

### ⏱️ Cron Jobs (Agendamentos)

#### 🔹 Netlify Scheduled Functions

Para tarefas leves, como:
- Enviar notificações
- Gerar relatórios diários
- Pingar webhooks
- Tarefas não críticas

Exemplo:
```toml
[[scheduled]]
path = "/.netlify/functions/daily-summary"
cron = "0 9 * * *"
```

#### 🔹 Supabase Scheduled Edge Functions

Para tarefas críticas do sistema:
- Processar pagamentos recorrentes
- Expirar trials
- Limpar contas inativas
- Recalcular métricas
- Atualizar dashboards

Configuração:
```bash
supabase functions deploy billing --schedule "every 1 hour"
```

---

## 🏗️ Arquitetura Geral

```
┌──────────────────────┐
│      Next.js         │  → UI / SSR / Rotas
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Netlify Functions    │  → API pública da aplicação
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Supabase DB        │  → PostgreSQL + RLS
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Supabase Edge Funcs  │  → Lógica crítica + crons
└──────────────────────┘
```

```
Stripe → webhooks → Netlify Functions
Resend → emails → API
```

---

## 🧪 Desenvolvimento Local

**Frontend (Next.js)**
```sh
npm install
npm run dev
```

**Supabase**
```sh
supabase start
supabase migration up
supabase functions serve
```

**Netlify Local**
```sh
netlify dev
```

---

## 🚀 Deploy

**Next.js + Functions**
```sh
netlify deploy --prod
```

**Supabase DB + Edge Functions**
```sh
supabase db push
supabase functions deploy my-func
```

---

## 🔐 Variáveis de Ambiente

| Serviço   | Variáveis                                      |
|-----------|------------------------------------------------|
| Supabase  | SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY |
| Netlify   | Todas as do app + chaves privadas              |
| Stripe    | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET       |
| Resend    | RESEND_API_KEY                                 |

---

## 🎯 Objetivo dessa Infra

- Baratíssimo para manter (quase tudo gratuito)
- Escalável automaticamente
- Arquitetura simples (serverless)
- Rápido para desenvolver
- Seguro (RLS + JWT)
- Pronto para SaaS (billing, cron, auth, db, API)