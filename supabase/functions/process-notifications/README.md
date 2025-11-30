# Process Notifications Edge Function

Edge Function que processa notificações pendentes (lembretes de pagamento e alertas de orçamento) e envia emails via Resend.

## Funcionalidades

### 1. Lembretes de Pagamento
- Busca transações pendentes que vencem nos próximos dias
- Agrupa lembretes por usuário
- Envia email com lista de transações próximas do vencimento
- Marca lembretes como enviados

### 2. Alertas de Orçamento
- Monitora orçamentos do mês atual
- Detecta quando orçamento atinge 80%, 90% ou 100%
- Envia email de alerta personalizado por nível
- Evita enviar alertas duplicados no mesmo mês

## Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis no Supabase Dashboard (Settings > Edge Functions):

```bash
RESEND_API_KEY=re_xxxxx                    # API Key do Resend
SUPABASE_URL=https://xxx.supabase.co      # URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY=xxxxx           # Service Role Key
NEXT_PUBLIC_APP_URL=https://finko.money   # URL da aplicação
EMAIL_FROM=Finko Money <noreply@finko.money>  # Email remetente
```

### Deploy

```bash
# Deploy da função
supabase functions deploy process-notifications

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxxxx
supabase secrets set NEXT_PUBLIC_APP_URL=https://finko.money
supabase secrets set EMAIL_FROM="Finko Money <noreply@finko.money>"
```

## Agendamento (pg_cron)

A função é executada automaticamente todos os dias às 8h via pg_cron.

### Verificar Jobs Agendados

```sql
SELECT * FROM cron.job WHERE jobname = 'process-daily-notifications';
```

### Executar Manualmente (para testes)

```sql
SELECT trigger_notification_processing();
```

### Ajustar Horário

```sql
-- Remover job existente
SELECT cron.unschedule('process-daily-notifications');

-- Criar novo job (exemplo: às 9h)
SELECT cron.schedule(
  'process-daily-notifications',
  '0 9 * * *',  -- 9h da manhã
  $$SELECT trigger_notification_processing();$$
);
```

## Teste Local

### 1. Iniciar Supabase Local

```bash
supabase start
```

### 2. Servir a Edge Function

```bash
supabase functions serve process-notifications --env-file .env.local
```

### 3. Chamar a Função

```bash
curl -X POST http://localhost:54321/functions/v1/process-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Estrutura de Dados

### Tabela `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  type VARCHAR(50),  -- 'reminder', 'budget_alert_80', etc
  title TEXT,
  message TEXT,
  channel VARCHAR(20) DEFAULT 'email',
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tipos de Notificações

- `reminder` - Lembrete de pagamento
- `budget_alert_80` - Orçamento em 80%
- `budget_alert_90` - Orçamento em 90%
- `budget_alert_100` - Orçamento excedido

## Logs

Para visualizar logs da função:

```bash
supabase functions logs process-notifications
```

## Troubleshooting

### Emails não estão sendo enviados

1. Verifique se o RESEND_API_KEY está configurado corretamente
2. Confirme que o domínio está verificado no Resend
3. Verifique os logs da Edge Function

### Cron não está executando

1. Verifique se pg_cron está habilitado: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Confira se o job está ativo: `SELECT * FROM cron.job;`
3. Verifique os logs do PostgreSQL

### Notificações duplicadas

A função já previne duplicatas checando:
- Lembretes: campo `sent_at` na tabela `reminders`
- Alertas de orçamento: registros na tabela `notifications` com mesmo `budget_id` e `month`

## Próximas Melhorias

- [ ] Suporte a notificações via WhatsApp
- [ ] Notificações in-app (painel de notificações)
- [ ] Webhooks para integrações externas
- [ ] Agrupamento de emails diários (digest)
- [ ] Preferências de horário por usuário
