# Exemplos de Uso dos Módulos

## Exemplo 1: Criar uma Nova Categoria

### No Frontend (Server Action)

```typescript
// app/categorias/actions.ts
"use server";

import { CategoryService } from "@/src/modules/categories";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const input = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      icon: formData.get("icon") as string,
    };

    await CategoryService.create(user.id, input);

    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
```

### No Mobile (API Route)

```typescript
// React Native / Expo
const createCategory = async (name: string, color: string) => {
  const response = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

## Exemplo 2: Listar Transações com Filtros

### No Frontend (Client Component)

```typescript
// app/financeiro/page.tsx
import { createClient } from "@/lib/supabase/client";

export default async function FinanceiroPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Buscar usando Repository diretamente (em Server Component)
  const transactions = await TransactionRepository.findByUserId(user.id, {
    month: "2025-01",
    type: "expense",
    status: "pending",
  });

  return <TransactionTable transactions={transactions} />;
}
```

### No Mobile (API Route)

```typescript
const fetchTransactions = async (filters: TransactionFilters) => {
  const params = new URLSearchParams({
    type: filters.type,
    month: filters.month,
    status: filters.status,
  });

  const response = await fetch(`${API_URL}/api/transactions?${params}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const { data } = await response.json();
  return data;
};
```

## Exemplo 3: Criar Transação Parcelada

### No Frontend (Server Action)

```typescript
// app/financeiro/actions.ts
"use server";

import { TransactionService } from "@/src/modules/transactions";

export async function createInstallmentTransaction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    const input = {
      type: "expense" as const,
      amount: parseFloat(formData.get("amount") as string), // Valor TOTAL
      description: formData.get("description") as string,
      due_date: formData.get("due_date") as string,
      category_id: formData.get("category_id") as string,
      payment_method: "credit_card",
      installment_type: "parcelado" as const,
      installments_count: 12, // 12x
      tags: [],
    };

    // Service cria 12 transações automaticamente
    const transactions = await TransactionService.create(user.id, input);

    revalidatePath("/financeiro");
    return { success: true, data: transactions };
  } catch (error) {
    return { error: error.message };
  }
}
```

### No Mobile

```typescript
const createInstallmentPurchase = async (
  amount: number,
  description: string,
  installments: number
) => {
  const response = await fetch(`${API_URL}/api/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: "expense",
      amount, // Valor total
      description,
      due_date: new Date().toISOString().split("T")[0],
      installment_type: "parcelado",
      installments_count: installments,
      payment_method: "credit_card",
    }),
  });

  return await response.json();
};

// Uso
await createInstallmentPurchase(1200, "Notebook", 12);
// Cria 12 transações de R$ 100 cada
```

## Exemplo 4: Marcar Transação como Paga

### No Frontend (Server Action)

```typescript
// app/financeiro/actions.ts
export async function markAsPaid(transactionId: string) {
  try {
    const user = await getCurrentUser();

    await TransactionService.markAsPaid(transactionId, user.id);

    revalidatePath("/financeiro");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
```

### No Mobile

```typescript
const markTransactionAsPaid = async (transactionId: string) => {
  const response = await fetch(
    `${API_URL}/api/transactions/${transactionId}/mark-paid`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        paid_at: new Date().toISOString(), // Opcional
      }),
    }
  );

  return await response.json();
};
```

## Exemplo 5: Autenticação no Mobile

### Login

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const { data } = await response.json();

  // Salvar token para requisições futuras
  await AsyncStorage.setItem("@auth_token", data.user.access_token);

  return data;
};
```

### Signup

```typescript
const signup = async (
  email: string,
  password: string,
  fullName: string
) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  return await response.json();
};
```

## Exemplo 6: Criar um Novo Módulo (Budgets)

### 1. Criar estrutura

```bash
mkdir -p src/modules/budgets
touch src/modules/budgets/budget.schema.ts
touch src/modules/budgets/budget.repository.ts
touch src/modules/budgets/budget.service.ts
touch src/modules/budgets/budget.routes.ts
touch src/modules/budgets/index.ts
```

### 2. Schema

```typescript
// budget.schema.ts
import { z } from "zod";

export const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
```

### 3. Repository

```typescript
// budget.repository.ts
export class BudgetRepository {
  static async findByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data;
  }

  static async create(userId: string, input: CreateBudgetInput) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("budgets")
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
```

### 4. Service

```typescript
// budget.service.ts
export class BudgetService {
  static async list(userId: string) {
    return await BudgetRepository.findByUserId(userId);
  }

  static async create(userId: string, input: CreateBudgetInput) {
    // Validação de negócio: não permitir orçamento duplicado
    const existing = await BudgetRepository.findByMonth(
      userId,
      input.month,
      input.category_id
    );

    if (existing) {
      throw new Error("Já existe orçamento para esta categoria no mês");
    }

    return await BudgetRepository.create(userId, input);
  }
}
```

### 5. Routes

```typescript
// budget.routes.ts
export async function GET(request: NextRequest) {
  const user = await getUser();
  const budgets = await BudgetService.list(user.id);
  return NextResponse.json({ data: budgets });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  const body = await request.json();
  const input = createBudgetSchema.parse(body);
  const budget = await BudgetService.create(user.id, input);
  return NextResponse.json({ data: budget }, { status: 201 });
}
```

### 6. API Route

```typescript
// app/api/budgets/route.ts
import { GET, POST } from "@/src/modules/budgets/budget.routes";

export { GET, POST };
```

## Exemplo 7: Testes Unitários

### Service Test

```typescript
// __tests__/transaction.service.test.ts
import { TransactionService } from "@/src/modules/transactions";
import { TransactionRepository } from "@/src/modules/transactions";

// Mock repository
jest.mock("@/src/modules/transactions/transaction.repository");

describe("TransactionService", () => {
  it("should create a single transaction", async () => {
    const mockCreate = jest.spyOn(TransactionRepository, "create");
    mockCreate.mockResolvedValue({
      id: "123",
      type: "expense",
      amount: 100,
      // ...
    });

    const result = await TransactionService.create("user-id", {
      type: "expense",
      amount: 100,
      description: "Test",
      due_date: "2025-01-01",
      installment_type: "a_vista",
      is_recurring: false,
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(result.amount).toBe(100);
  });

  it("should create installment transactions", async () => {
    const mockCreateMany = jest.spyOn(TransactionRepository, "createMany");

    await TransactionService.create("user-id", {
      type: "expense",
      amount: 1200,
      description: "Notebook",
      due_date: "2025-01-01",
      installment_type: "parcelado",
      installments_count: 12,
    });

    expect(mockCreateMany).toHaveBeenCalledWith(
      "user-id",
      expect.arrayContaining([
        expect.objectContaining({ amount: 100 }),
      ])
    );
  });
});
```

## Dicas de Desenvolvimento

### 1. Sempre valide entrada com Zod

```typescript
// ✅ Bom
const input = createTransactionSchema.parse(body);
await TransactionService.create(userId, input);

// ❌ Ruim
await TransactionService.create(userId, body); // Sem validação
```

### 2. Use tipos do banco

```typescript
// ✅ Bom
import type { Database } from "@/types/database";
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// ❌ Ruim
interface Transaction { ... } // Duplicar tipos
```

### 3. Sempre faça revalidação após mutações

```typescript
// ✅ Bom
await TransactionService.create(userId, input);
revalidatePath("/financeiro");
revalidatePath("/dashboard");

// ❌ Ruim
await TransactionService.create(userId, input);
// Sem revalidar - dados antigos no cache
```

### 4. Trate erros adequadamente

```typescript
// ✅ Bom
try {
  await CategoryService.create(userId, input);
  return { success: true };
} catch (error) {
  return { error: error instanceof Error ? error.message : "Erro desconhecido" };
}

// ❌ Ruim
const result = await CategoryService.create(userId, input);
// Sem try/catch - erro não tratado
```
