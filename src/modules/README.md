# Módulos da Aplicação

Esta pasta contém a camada de backend organizada em módulos seguindo a arquitetura de **camadas** (layers).

## Estrutura de Módulos

Cada módulo segue o padrão:

```
module-name/
├── module-name.schema.ts      # Schemas Zod para validação
├── module-name.repository.ts  # Acesso ao banco de dados (Supabase)
├── module-name.service.ts     # Lógica de negócio
├── module-name.routes.ts      # Handlers das API routes
└── index.ts                   # Exports do módulo
```

## Camadas

### 1. Schema (Validação)

Define os schemas Zod para validação de entrada/saída:

```typescript
// category.schema.ts
export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
```

### 2. Repository (Acesso a Dados)

Responsável por **todas** as operações de banco de dados:

```typescript
// category.repository.ts
export class CategoryRepository {
  static async findByUserId(userId: string) {
    const supabase = await createClient();
    // ... query
  }
}
```

**Regras:**
- Somente o Repository pode chamar o Supabase client
- Retorna tipos do banco (Database types)
- Lança exceções em caso de erro

### 3. Service (Lógica de Negócio)

Contém as **regras de negócio** da aplicação:

```typescript
// category.service.ts
export class CategoryService {
  static async create(userId: string, input: CreateCategoryInput) {
    // Validação de negócio
    const exists = await CategoryRepository.existsByName(input.name, userId);
    if (exists) throw new Error("Categoria já existe");

    // Criação
    return await CategoryRepository.create(userId, input);
  }
}
```

**Regras:**
- Chama Repositories para acesso aos dados
- Implementa validações de negócio
- Orquestra operações complexas
- Nunca chama Supabase diretamente

### 4. Routes (API Handlers)

Define os handlers HTTP para as API routes:

```typescript
// category.routes.ts
export async function GET(request: NextRequest) {
  const user = await getUser();
  const categories = await CategoryService.list(user.id);
  return NextResponse.json({ data: categories });
}
```

**Regras:**
- Faz autenticação
- Valida entrada com schemas
- Chama Services
- Formata resposta HTTP

## Módulos Disponíveis

### 📁 categories

Gerenciamento de categorias de transações.

**Endpoints:**
- `GET /api/categories` - Lista categorias
- `POST /api/categories` - Cria categoria
- `PATCH /api/categories/[id]` - Atualiza categoria
- `DELETE /api/categories/[id]` - Deleta categoria

### 📁 transactions

Gerenciamento de transações financeiras (receitas/despesas).

**Endpoints:**
- `GET /api/transactions` - Lista transações (com filtros)
- `POST /api/transactions` - Cria transação (à vista ou parcelada)
- `PATCH /api/transactions/[id]` - Atualiza transação
- `DELETE /api/transactions/[id]` - Deleta transação
- `POST /api/transactions/[id]/mark-paid` - Marca como paga
- `POST /api/transactions/[id]/mark-unpaid` - Marca como não paga

**Recursos:**
- Transações à vista
- Parcelamento (divide valor total em N parcelas mensais)
- Recorrência (mensal/semanal/anual)
- Tags e categorização
- Filtros avançados

### 📁 user

Autenticação e perfil de usuário.

**Endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/logout` - Logout
- `POST /api/auth/reset-password` - Recuperar senha
- `GET /api/user/profile` - Buscar perfil
- `PATCH /api/user/profile` - Atualizar perfil
- `POST /api/user/change-password` - Alterar senha
- `DELETE /api/user` - Deletar conta

## Como Usar

### No Frontend (Server Actions)

As **Server Actions** em `app/*/actions.ts` chamam os Services:

```typescript
"use server";

import { TransactionService } from "@/src/modules/transactions";

export async function createTransaction(formData: FormData) {
  const input = parseFormData(formData);
  await TransactionService.create(userId, input);
  revalidatePath("/financeiro");
}
```

### No Mobile (API Routes)

O mobile pode consumir as rotas em `app/api/*`:

```typescript
// React Native / Expo
const response = await fetch("https://app.com/api/transactions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    type: "expense",
    amount: 100,
    description: "Compra",
    // ...
  })
});
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│ Frontend (Web)                                      │
│ ├─ Server Actions (app/*/actions.ts)                │
│ └─ Client Components (app/*/components/*.tsx)       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Mobile                                              │
│ └─ API Routes (app/api/*/route.ts)                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Service Layer (src/modules/*/service.ts)            │
│ ├─ Lógica de negócio                                │
│ ├─ Validações                                       │
│ └─ Orquestração                                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Repository Layer (src/modules/*/repository.ts)      │
│ ├─ Queries ao banco                                 │
│ ├─ CRUD operations                                  │
│ └─ Data mapping                                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Database (Supabase PostgreSQL)                      │
│ ├─ users                                            │
│ ├─ categories                                       │
│ ├─ transactions                                     │
│ └─ ...                                              │
└─────────────────────────────────────────────────────┘
```

## Benefícios da Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem um propósito específico
2. **Testabilidade**: Services podem ser testados sem banco de dados (mock repositories)
3. **Reutilização**: Mesma lógica para Web e Mobile
4. **Manutenibilidade**: Mudanças no banco afetam apenas repositories
5. **Escalabilidade**: Fácil adicionar novos módulos ou features

## Exemplo Completo: Criar Transação

```typescript
// 1. Frontend chama Server Action
await createTransaction(formData);

// 2. Server Action chama Service
await TransactionService.create(userId, input);

// 3. Service valida e chama Repository
const exists = await CategoryRepository.findById(input.category_id);
if (!exists) throw new Error("Categoria inválida");

const transaction = await TransactionRepository.create(userId, {
  type: input.type,
  amount: input.amount,
  // ...
});

// 4. Repository executa query
const { data, error } = await supabase
  .from("transactions")
  .insert({ ... })
  .select()
  .single();

// 5. Retorna para o frontend
return data;
```

## Próximos Passos

- [ ] Criar módulo de `budgets` (orçamentos)
- [ ] Criar módulo de `reminders` (lembretes)
- [ ] Criar módulo de `goals` (metas)
- [ ] Criar módulo de `reports` (relatórios)
- [ ] Adicionar testes unitários para Services
- [ ] Adicionar testes de integração para Repositories
