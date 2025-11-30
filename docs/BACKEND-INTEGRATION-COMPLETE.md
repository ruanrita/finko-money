# Integração Completa - Backend Services

## ✅ Status: Implementação Completa

Todos os services principais agora validam limites **no backend** antes de criar recursos.

---

## 📦 Services Integrados

### 1. CategoryService ✅

**Arquivo:** `src/modules/categories/category.service.ts`

**Método:** `create()`

```typescript
static async create(
  userId: string,
  branchId: string,
  input: CreateCategoryInput
): Promise<Category> {
  // 1. Verificar limite do plano
  const usageCheck = await UsageService.checkUsageLimit(userId, 'category', branchId);

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} categorias atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} categorias disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para criar mais categorias.`
    );
  }

  // 2. Validação de negócio
  const exists = await CategoryRepository.existsByName(input.name, branchId, userId);
  if (exists) {
    throw new Error("Já existe uma categoria com este nome");
  }

  // 3. Criar categoria
  return await CategoryRepository.create(userId, { ...input, branch_id: branchId });
}
```

---

### 2. TransactionService ✅

**Arquivo:** `src/modules/transactions/transaction.service.ts`

**Método:** `create()`

**Destaque:** Valida também transações parceladas (múltiplas transações de uma vez)

```typescript
static async create(
  userId: string,
  branchId: string,
  input: CreateTransactionInput
): Promise<Transaction | Transaction[]> {
  // 1. Verificar limite do plano
  const usageCheck = await UsageService.checkUsageLimit(userId, 'transaction', branchId);

  // Para parceladas, verificar se tem espaço para todas as parcelas
  const transactionsToCreate = input.installment_type === 'parcelado'
    ? input.installments_count
    : 1;

  const spaceAvailable = usageCheck.limit
    ? (usageCheck.limit - usageCheck.current)
    : Infinity;

  if (!usageCheck.allowed || transactionsToCreate > spaceAvailable) {
    const remaining = usageCheck.limit ? usageCheck.limit - usageCheck.current : 0;
    throw new Error(
      `Limite de transações atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} transações este mês. ` +
      `${input.installment_type === 'parcelado'
        ? `Essa compra parcelada criaria ${transactionsToCreate} transações, mas você tem espaço para apenas ${remaining}. `
        : ''
      }` +
      `Faça upgrade do plano ${usageCheck.planName} para criar mais transações.`
    );
  }

  // 2. Criar transação (à vista ou parcelada)
  // ... lógica de criação
}
```

---

### 3. GoalService ✅

**Arquivo:** `src/modules/goals/goal.service.ts`

**Método:** `createGoal()`

```typescript
static async createGoal(
  userId: string,
  branchId: string,
  data: CreateGoalInput
): Promise<CreateGoalResponse> {
  // 1. Verificar limite do plano
  const usageCheck = await UsageService.checkUsageLimit(userId, 'goal', branchId);

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} metas atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} metas disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para criar mais metas.`
    );
  }

  // 2. Verificar acesso ao branch
  await BranchAccessControl.requireMembership(branchId, userId);

  // 3. Lógica de negócio (cálculo de reserva de emergência, etc.)
  if (data.goal_type === 'emergency_fund' && !data.target_amount) {
    const suggested = await GoalRepository.calculateEmergencyFundSuggestion(userId, branchId);
    data.target_amount = suggested;
  }

  // 4. Criar meta
  const goal = await GoalRepository.create(userId, branchId, data);

  return { goal, message: "Meta criada com sucesso!" };
}
```

---

### 4. BudgetService ✅

**Arquivo:** `src/modules/budgets/budget.service.ts`

**Método:** `createBudget()`

```typescript
static async createBudget(input: CreateBudgetInput, userId: string) {
  // 1. Verificar limite do plano
  const usageCheck = await UsageService.checkUsageLimit(userId, 'budget');

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} orçamentos atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} orçamentos disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para criar mais orçamentos.`
    );
  }

  // 2. Criar orçamento
  return await BudgetRepository.create(input, userId);
}
```

---

### 5. BranchService ✅

**Arquivo:** `src/modules/branches/branch.service.ts`

**Métodos:** `createBranch()` e `addMember()`

#### 5.1 Criar Branch

```typescript
static async createBranch(input: CreateBranchInput, userId: string) {
  // 1. Verificar limite de branches
  const usageCheck = await UsageService.checkUsageLimit(userId, 'branch');

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} branches atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} branches disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para criar mais branches.`
    );
  }

  // 2. Criar branch
  return await BranchRepository.create(input, userId);
}
```

#### 5.2 Adicionar Membro

```typescript
static async addMember(branchId: string, input: AddMemberInput, invitedBy: string) {
  // 1. Verificar limite de membros da equipe
  const usageCheck = await UsageService.checkUsageLimit(invitedBy, 'team_member', branchId);

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} membros na equipe atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} membros disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para adicionar mais membros à equipe.`
    );
  }

  // 2. Buscar usuário por email
  const targetUser = await BranchRepository.getUserByEmail(input.email);
  if (!targetUser) {
    throw new Error("Usuário não encontrado com este email");
  }

  // 3. Adicionar membro
  return await BranchRepository.addMember(branchId, targetUser.id, input.role, invitedBy);
}
```

---

### 6. ReminderService ✅

**Arquivo:** `src/modules/reminders/reminder.service.ts`

**Método:** `createReminder()`

```typescript
static async createReminder(input: CreateReminderInput, userId: string) {
  // 1. Verificar limite de lembretes
  const usageCheck = await UsageService.checkUsageLimit(userId, 'reminder');

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} lembretes atingido. ` +
      `Você está usando ${usageCheck.current}/${usageCheck.limit} lembretes disponíveis no plano ${usageCheck.planName}. ` +
      `Faça upgrade para criar mais lembretes.`
    );
  }

  // 2. Criar lembrete
  return await ReminderRepository.create(input, userId);
}
```

---

## 🎯 Benefícios da Integração no Backend

### 1. **Segurança** 🔒
- ✅ Impossível burlar pelo frontend
- ✅ Validação acontece no servidor
- ✅ Usuários maliciosos não podem criar mais recursos

### 2. **Compatibilidade** 📱
- ✅ Funciona para **Web**
- ✅ Funciona para **Mobile** (apps nativos)
- ✅ Funciona para **APIs externas**
- ✅ Mesma lógica para todos os clientes

### 3. **Mensagens Informativas** 💬
- ✅ Informa limite atingido
- ✅ Mostra uso atual (ex: 45/50)
- ✅ Indica nome do plano
- ✅ Sugere upgrade

### 4. **Validação Inteligente** 🧠
- ✅ Transações parceladas: verifica espaço para todas as parcelas
- ✅ Conta uso em tempo real
- ✅ Considera período (mensal para transações)

---

## 📊 Recursos Validados

| Recurso | Service | Método | Limite Por |
|---------|---------|--------|------------|
| Transações | TransactionService | create() | Mês |
| Categorias | CategoryService | create() | Total |
| Metas | GoalService | createGoal() | Total |
| Orçamentos | BudgetService | createBudget() | Total |
| Branches | BranchService | createBranch() | Total (owner) |
| Membros | BranchService | addMember() | Por Branch |
| Lembretes | ReminderService | createReminder() | Total |

---

## 🔄 Como Funciona

### Fluxo de Verificação:

```
1. Usuário tenta criar recurso
        ↓
2. Service chama UsageService.checkUsageLimit()
        ↓
3. UsageService busca plano do usuário
        ↓
4. Conta uso atual do recurso
        ↓
5. Compara: atual < limite?
        ↓
   SIM: Permite criar ✅
   NÃO: Lança erro ❌
        ↓
6. Erro retorna ao cliente com mensagem clara
```

### Exemplo de Erro:

```json
{
  "error": "Limite de 50 transações atingido. Você está usando 50/50 transações este mês. Faça upgrade do plano Lançamento Inicial para criar mais transações."
}
```

---

## 🧪 Como Testar

### 1. Teste via API (Postman/Insomnia)

```bash
# Criar categoria (vai validar limite)
POST http://localhost:3000/api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Nova Categoria",
  "color": "#FF5733",
  "icon": "shopping-cart"
}
```

**Resposta quando limite atingido:**
```json
{
  "error": "Limite de 5 categorias atingido. Você está usando 5/5 categorias disponíveis no plano Lançamento Inicial. Faça upgrade para criar mais categorias."
}
```

### 2. Teste via Frontend

O frontend pode usar o hook `useUsageLimit` para verificação preventiva, mas a **segurança real está no backend**:

```tsx
const { canCreate } = useUsageLimit('category');

const handleSubmit = async (data) => {
  // Verificação preventiva (opcional, melhora UX)
  if (!canCreate()) {
    return; // Mostra toast
  }

  try {
    // Chamada à API (validação real no backend)
    await fetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    // Erro do backend se limite foi atingido
    toast.error(error.message);
  }
};
```

---

## 📝 Próximos Passos

### Para Mobile/Apps Nativos:

1. Chamar as APIs normalmente
2. Tratar erro de limite:

```typescript
// React Native / Flutter / etc
try {
  const response = await createCategory(data);
} catch (error) {
  if (error.message.includes('Limite')) {
    // Mostrar dialog de upgrade
    showUpgradeDialog();
  }
}
```

### Para Web:

1. Usar hook `useUsageLimit` para UX preventiva
2. Backend sempre valida (segurança)
3. Tratar erros da API normalmente

---

## ✅ Checklist de Integração

- [x] CategoryService.create()
- [x] TransactionService.create() (com validação de parceladas)
- [x] GoalService.createGoal()
- [x] BudgetService.createBudget()
- [x] BranchService.createBranch()
- [x] BranchService.addMember()
- [x] ReminderService.createReminder()
- [x] Mensagens de erro informativas
- [x] Validação de espaço para parceladas
- [x] Compatível com web e mobile

---

## 🎉 Conclusão

**Sistema de limitações 100% funcional no backend!**

- ✅ Seguro
- ✅ Escalável
- ✅ Multi-plataforma (web/mobile)
- ✅ Mensagens claras
- ✅ Pronto para produção

---

**Última atualização:** 29/11/2025
**Status:** ✅ Completo
