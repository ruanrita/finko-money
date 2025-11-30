# Quick Start - Sistema de Limitações

## 🚀 Início Rápido

### 1. Verificar que a migration foi aplicada

```bash
# Já foi executado!
npx supabase db reset
```

### 2. Verificar usuários no banco

```sql
SELECT u.email, u.is_early_adopter, sp.display_name as plan
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id;
```

### 3. Usar no seu componente

```tsx
import { useUsageLimit } from '@/hooks/useUsageLimit';

function TransactionDialog() {
  const { canCreate, usageInfo } = useUsageLimit('transaction');

  const handleSubmit = async (data) => {
    // Verificar limite ANTES de criar
    if (!canCreate()) {
      return; // Hook mostra toast automático
    }

    // Criar transação...
  };

  return (
    <Dialog>
      {/* Mostrar progresso */}
      {usageInfo && (
        <p>{usageInfo.current}/{usageInfo.limit} transações</p>
      )}
      {/* Formulário */}
    </Dialog>
  );
}
```

### 4. Tipos de Recursos Disponíveis

```ts
type ResourceType =
  | 'transaction'    // Transações
  | 'category'       // Categorias
  | 'goal'           // Metas
  | 'budget'         // Orçamentos
  | 'team_member'    // Membros da equipe
  | 'branch'         // Branches
  | 'reminder'       // Lembretes
```

### 5. Verificar Features

```tsx
import { useFeatureAccess } from '@/hooks/useUsageLimit';

function ExportButton() {
  const { hasAccess } = useFeatureAccess('export_pdf');

  if (!hasAccess) {
    return <p>Upgrade para exportar PDF</p>;
  }

  return <Button onClick={handleExportPDF}>Exportar PDF</Button>;
}
```

### 6. Mostrar Plano do Usuário

```tsx
import { useUserPlan } from '@/hooks/useUsageLimit';

function SettingsPage() {
  const { plan, isEarlyAdopter } = useUserPlan();

  return (
    <div>
      <h2>Plano: {plan?.display_name}</h2>
      {isEarlyAdopter && <Badge>Early Adopter 🎉</Badge>}

      <ul>
        <li>Transações: {plan?.max_transactions}/mês</li>
        <li>Categorias: {plan?.max_categories}</li>
        <li>Metas: {plan?.max_goals}</li>
        <li>Orçamentos: {plan?.max_budgets}</li>
      </ul>
    </div>
  );
}
```

## 📚 Mais Informações

- **Exemplos completos:** `docs/usage-limits-integration-examples.md`
- **Resumo de implementação:** `docs/IMPLEMENTATION-SUMMARY.md`
- **Plano Stripe:** `docs/stripe-integration.md`

## ✅ Status Atual

Todos os usuários têm o plano **"Lançamento Inicial"** com:
- 50 transações/mês
- 5 categorias
- 3 metas
- 3 orçamentos
- 4 membros
- 3 branches
- 6 lembretes

Todos são marcados como **Early Adopters** (acesso vitalício quando ativar Fase 2).
