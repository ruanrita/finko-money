# Deploy no Netlify com Edge Functions do Supabase

Este guia mostra como configurar o deploy automático da aplicação Next.js e das Edge Functions do Supabase no Netlify.

## Pré-requisitos

1. Conta no [Netlify](https://netlify.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório GitHub conectado ao Netlify
4. Supabase CLI instalado como dependência (já configurado em `devDependencies`)

## Configuração de Variáveis de Ambiente no Netlify

Acesse: **Site Settings** → **Environment variables** e configure:

### 1. Variáveis do Supabase (Obrigatórias)

```bash
# Connection String para migrations (use porta 6543)
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?sslmode=require

# Project Reference (encontre em Project Settings)
SUPABASE_PROJECT_REF=abcdefghijklmnop

# Access Token para deploy (gere em https://app.supabase.com/account/tokens)
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URLs públicas do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Variáveis do Resend (para Edge Functions)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Finko Money <noreply@finko.money>
```

### 3. Variáveis da Aplicação

```bash
NEXT_PUBLIC_APP_URL=https://seu-site.netlify.app
NODE_VERSION=22
```

### 4. Variáveis do Stripe (se aplicável)

```bash
STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## Como obter o SUPABASE_ACCESS_TOKEN

1. Acesse [Supabase Account Tokens](https://app.supabase.com/account/tokens)
2. Clique em **Generate New Token**
3. Dê um nome (ex: "Netlify Deploy")
4. Copie o token gerado
5. Adicione nas variáveis de ambiente do Netlify

⚠️ **IMPORTANTE**: Este token tem acesso total ao seu projeto. Guarde com segurança!

## Como obter o SUPABASE_PROJECT_REF

1. Acesse seu projeto no Supabase
2. Vá em **Project Settings** → **General**
3. Copie o **Reference ID** (exemplo: `abcdefghijklmnop`)

## Fluxo de Deploy

Quando você faz push para o repositório, o Netlify executa:

```bash
# 1. Aplica migrations no banco de dados
npm run supa:migrate

# 2. Deploy das Edge Functions no Supabase
npm run supa:deploy-functions

# 3. Build da aplicação Next.js
npm run build
```

## Comandos Úteis

### Deploy manual das Edge Functions

```bash
npm run supa:deploy-functions
```

### Deploy manual dos secrets

```bash
npm run supa:deploy-secrets
```

### Verificar Edge Functions deployadas

```bash
supabase functions list --project-ref $SUPABASE_PROJECT_REF
```

### Ver logs das Edge Functions

```bash
supabase functions logs process-notifications --project-ref $SUPABASE_PROJECT_REF
```

## Estrutura do Deploy

```
┌─────────────┐
│   GitHub    │  Push
│ Repository  │────┐
└─────────────┘    │
                   ▼
              ┌─────────┐
              │ Netlify │
              │  Build  │
              └────┬────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  Migrations  Edge Functions  Next.js
      │            │            │
      ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │ Supabase │  │ Netlify  │
│    DB    │  │   Deno   │  │  Hosting │
└──────────┘  └──────────┘  └──────────┘
```

## Troubleshooting

### Erro: "supabase: command not found"

A CLI do Supabase está instalada como `devDependency`. O Netlify deve instalá-la automaticamente. Verifique se:
- O `supabase` está em `devDependencies` no `package.json`
- O comando usa `npx supabase` ou está sendo executado após `npm install`

### Erro: "Invalid access token"

1. Verifique se o token está correto no Netlify
2. Gere um novo token em https://app.supabase.com/account/tokens
3. Atualize a variável `SUPABASE_ACCESS_TOKEN` no Netlify

### Erro: "Project not found"

Verifique se `SUPABASE_PROJECT_REF` está correto. Deve ser apenas o ID do projeto (ex: `abcdefghijklmnop`), não a URL completa.

### Migrations não estão sendo aplicadas

1. Verifique se `SUPABASE_DB_URL` está configurado
2. Use a porta **6543** (Session Pooler) para compatibilidade IPv4
3. Formato correto: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?sslmode=require`

### Edge Functions não estão sendo deployadas

1. Verifique se as variáveis `SUPABASE_PROJECT_REF` e `SUPABASE_ACCESS_TOKEN` estão configuradas
2. Confirme que a pasta `supabase/functions` existe no repositório
3. Verifique os logs de build do Netlify para erros específicos

### Secrets das Edge Functions não estão configurados

Execute manualmente após o primeiro deploy:

```bash
npm run supa:deploy-secrets
```

Ou configure diretamente no Supabase Dashboard:
**Project Settings** → **Edge Functions** → **Secrets**

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Access token do Supabase gerado e configurado
- [ ] Project Reference do Supabase configurado
- [ ] Resend API Key configurado
- [ ] Build executado com sucesso
- [ ] Migrations aplicadas
- [ ] Edge Functions deployadas
- [ ] Secrets das Edge Functions configurados
- [ ] Aplicação acessível no domínio

## Monitoramento

### Logs do Netlify
```
https://app.netlify.com/sites/[seu-site]/deploys
```

### Logs das Edge Functions
```bash
supabase functions logs process-notifications --project-ref $SUPABASE_PROJECT_REF
```

### Verificar Cron Jobs
```sql
SELECT * FROM cron.job WHERE jobname = 'process-daily-notifications';
```

## Próximos Passos

Após o primeiro deploy bem-sucedido:

1. Configure o domínio customizado no Netlify
2. Configure HTTPS/SSL
3. Teste o envio de emails (lembretes e alertas)
4. Monitore os logs das Edge Functions
5. Configure alertas de erro no Netlify
