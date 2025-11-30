# Guia do Administrador - Sistema de Assinaturas

## 📋 Visão Geral

Como administrador, você pode:
- Ativar/desativar o sistema de assinaturas
- Gerenciar planos (criar, editar, remover)
- Alterar limites de recursos
- Ver estatísticas de uso
- Controlar quem tem acesso a features

---

## 🔐 Como se tornar Admin

1. Acesse o banco de dados (Supabase Studio ou SQL)
2. Execute:
   ```sql
   UPDATE users
   SET is_admin = true
   WHERE email = 'seu-email@exemplo.com';
   ```

---

## 🎛️ Controlar Sistema de Assinaturas

### Ativar Assinaturas

**Quando ativar:**
- Stripe configurado
- Produtos criados no Stripe
- Webhooks configurados
- Pronto para receber pagamentos

**Como ativar:**

```bash
# Via API
POST /api/admin/subscriptions/toggle
Content-Type: application/json
Authorization: Bearer <seu-token>

{
  "enabled": true
}
```

**Resposta:**
```json
{
  "enabled": true,
  "message": "Assinaturas ativadas com sucesso"
}
```

**Efeito:**
- ✅ Novos usuários ganham plano Free
- ✅ Checkout de Pro fica disponível
- ✅ Usuários atuais permanecem como early adopters

---

### Desativar Assinaturas

**Quando desativar:**
- Manutenção do sistema
- Problemas com Stripe
- Período de testes/ajustes

**Como desativar:**

```bash
POST /api/admin/subscriptions/toggle
Content-Type: application/json
Authorization: Bearer <seu-token>

{
  "enabled": false
}
```

**Efeito:**
- ✅ Novos usuários viram early adopters (acesso vitalício)
- ✅ Checkout fica bloqueado
- ✅ Usuários existentes mantêm seus planos

---

### Ver Status Atual

```bash
GET /api/admin/subscriptions/toggle
Authorization: Bearer <seu-token>
```

**Resposta:**
```json
{
  "enabled": false,
  "updated_at": "2025-11-29T10:30:00Z"
}
```

---

## 📦 Gerenciar Planos

### Listar Todos os Planos

```bash
GET /api/admin/plans
Authorization: Bearer <seu-token>
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "initial_launch",
      "display_name": "Lançamento Inicial",
      "max_transactions": 50,
      "max_categories": 5,
      "is_active": false
    },
    {
      "id": "uuid",
      "name": "free",
      "display_name": "Plano Free",
      "max_transactions": 50,
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "pro",
      "display_name": "Plano Pro",
      "max_transactions": 300,
      "is_active": true
    }
  ]
}
```

---

### Ver Plano Específico

```bash
GET /api/admin/plans/{id}
Authorization: Bearer <seu-token>
```

---

### Criar Novo Plano

```bash
POST /api/admin/plans
Content-Type: application/json
Authorization: Bearer <seu-token>

{
  "name": "enterprise",
  "display_name": "Plano Enterprise",
  "stripe_product_id": "prod_XXX",
  "max_transactions": 1000,
  "max_categories": 50,
  "max_goals": 30,
  "max_budgets": 20,
  "max_team_members": 50,
  "max_branches": 10,
  "max_reminders": 50,
  "has_advanced_reports": true,
  "export_formats": ["csv", "pdf", "excel"],
  "support_level": "priority",
  "history_months": 60,
  "is_active": true
}
```

**Campos:**
- `name` (obrigatório): ID único (sem espaços, lowercase)
- `display_name` (obrigatório): Nome exibido
- `stripe_product_id`: ID do produto no Stripe (null se grátis)
- `max_*`: Limites de recursos (null = ilimitado)
- `has_advanced_reports`: Acesso a relatórios avançados
- `export_formats`: Array de formatos (csv, pdf, excel)
- `support_level`: email, priority, dedicated
- `history_months`: Meses de histórico disponível
- `is_active`: Se o plano está ativo (aparece na seleção)

---

### Atualizar Plano

```bash
PATCH /api/admin/plans/{id}
Content-Type: application/json
Authorization: Bearer <seu-token>

{
  "max_transactions": 100,
  "max_categories": 10,
  "display_name": "Plano Free Atualizado"
}
```

**Nota:** Você pode enviar apenas os campos que quer atualizar.

**Exemplo - Aumentar limite de transações do Free:**
```json
{
  "max_transactions": 100
}
```

---

### Desativar Plano

```bash
DELETE /api/admin/plans/{id}
Authorization: Bearer <seu-token>
```

**O que acontece:**
- Plano fica com `is_active = false`
- Não aparece mais na seleção de planos
- Usuários que já têm esse plano continuam com ele
- Pode ser reativado depois (UPDATE is_active = true)

---

## 📊 Estatísticas

### Ver Distribuição de Usuários por Plano

```bash
GET /api/admin/plans/stats
Authorization: Bearer <seu-token>
```

**Resposta:**
```json
{
  "data": {
    "Lançamento Inicial": 42,
    "Plano Free": 108,
    "Plano Pro": 15,
    "Sem plano": 2
  }
}
```

---

## 🔧 Casos de Uso Comuns

### 1. Liberar mais recursos temporariamente

**Cenário:** Black Friday - dobrar limites do plano Free por 1 semana

```bash
# Salvar valores atuais
GET /api/admin/plans/{free_plan_id}

# Atualizar
PATCH /api/admin/plans/{free_plan_id}
{
  "max_transactions": 100,
  "max_categories": 10
}

# Após 1 semana, reverter
PATCH /api/admin/plans/{free_plan_id}
{
  "max_transactions": 50,
  "max_categories": 5
}
```

---

### 2. Criar plano promocional

```bash
POST /api/admin/plans
{
  "name": "promo_natal",
  "display_name": "Promoção de Natal",
  "max_transactions": 200,
  "max_categories": 15,
  "max_goals": 10,
  "max_budgets": 7,
  "max_team_members": 5,
  "max_branches": 3,
  "max_reminders": 10,
  "has_advanced_reports": true,
  "export_formats": ["csv", "pdf"],
  "support_level": "email",
  "history_months": 12,
  "is_active": true
}
```

Depois atribua manualmente a usuários selecionados:
```sql
UPDATE users
SET subscription_plan_id = '{id_do_plano_promo}'
WHERE email IN ('user1@exemplo.com', 'user2@exemplo.com');
```

---

### 3. Lançamento do sistema de assinaturas

**Checklist:**

1. ✅ Configurar Stripe Dashboard (produtos e prices)
2. ✅ Atualizar migration com IDs reais do Stripe
3. ✅ Executar migration: `npx supabase db reset`
4. ✅ Configurar webhook no Stripe
5. ✅ Atualizar price IDs em `app/pricing/page.tsx`
6. ✅ Testar checkout com cartão de teste
7. ✅ Ativar assinaturas:
   ```bash
   POST /api/admin/subscriptions/toggle
   { "enabled": true }
   ```
8. ✅ Comunicar aos usuários sobre novos planos

---

### 4. Migrar usuário para outro plano

**Via SQL:**
```sql
-- Ver plano atual
SELECT u.email, sp.display_name
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
WHERE u.email = 'usuario@exemplo.com';

-- Mudar para Pro manualmente (cortesia)
UPDATE users
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
WHERE email = 'usuario@exemplo.com';
```

---

## ⚙️ Manutenção

### Verificar integridade dos planos

```sql
-- Ver planos sem usuários
SELECT sp.display_name, COUNT(u.id) as total_users
FROM subscription_plans sp
LEFT JOIN users u ON u.subscription_plan_id = sp.id
GROUP BY sp.id, sp.display_name
ORDER BY total_users DESC;

-- Ver usuários sem plano
SELECT email FROM users WHERE subscription_plan_id IS NULL;
```

---

### Corrigir usuários sem plano

```sql
-- Atribuir plano Free para usuários sem plano
UPDATE users
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free')
WHERE subscription_plan_id IS NULL
AND is_early_adopter = false;

-- Atribuir plano inicial para early adopters sem plano
UPDATE users
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'initial_launch')
WHERE subscription_plan_id IS NULL
AND is_early_adopter = true;
```

---

## 🚨 Troubleshooting

### Erro: "Acesso negado: somente administradores"

**Causa:** Usuário não tem `is_admin = true`

**Solução:**
```sql
UPDATE users SET is_admin = true WHERE email = 'seu-email@exemplo.com';
```

---

### Assinaturas não ativam mesmo após toggle

**Causa:** Cache ou erro no banco

**Solução:**
```sql
-- Verificar valor atual
SELECT * FROM system_config WHERE key = 'subscriptions_enabled';

-- Forçar ativação
UPDATE system_config
SET value = 'true', updated_at = NOW()
WHERE key = 'subscriptions_enabled';
```

---

### Usuário não consegue fazer checkout

**Possíveis causas:**
1. Assinaturas desativadas → Ativar via toggle
2. Price ID inválido → Verificar em `app/pricing/page.tsx`
3. Stripe não configurado → Verificar env vars
4. Usuário não autenticado → Verificar login

**Debug:**
```bash
# Verificar se assinaturas estão ativas
GET /api/admin/subscriptions/toggle

# Ver erro no console do navegador (Network tab)
```

---

## 📝 Logs e Auditoria

### Ver alterações em planos

```sql
SELECT
  sp.display_name,
  sp.updated_at,
  sp.max_transactions,
  sp.max_categories
FROM subscription_plans sp
ORDER BY sp.updated_at DESC;
```

---

### Ver histórico de assinaturas

```sql
SELECT
  u.email,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.cancel_at_period_end,
  sp.display_name as plano
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;
```

---

## 🎯 Resumo de Comandos Rápidos

```bash
# Ver status das assinaturas
GET /api/admin/subscriptions/toggle

# Ativar assinaturas
POST /api/admin/subscriptions/toggle { "enabled": true }

# Desativar assinaturas
POST /api/admin/subscriptions/toggle { "enabled": false }

# Listar planos
GET /api/admin/plans

# Ver estatísticas
GET /api/admin/plans/stats

# Atualizar limites de um plano
PATCH /api/admin/plans/{id} { "max_transactions": 100 }

# Criar novo plano
POST /api/admin/plans { ...dados }

# Desativar plano
DELETE /api/admin/plans/{id}
```

---

**Última atualização:** 29/11/2025
**Versão:** 1.0
