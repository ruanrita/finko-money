# Arquitetura do Projeto Finko Money

## Estrutura de Pastas

```
finko-money/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (para mobile)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── signup/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── categories/
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/route.ts     # PATCH, DELETE
│   │   ├── transactions/
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/
│   │   │       ├── route.ts      # PATCH, DELETE
│   │   │       ├── mark-paid/route.ts
│   │   │       └── mark-unpaid/route.ts
│   │   └── user/
│   │       ├── route.ts          # DELETE (deletar conta)
│   │       ├── profile/route.ts  # GET, PATCH
│   │       └── change-password/route.ts
│   │
│   ├── login/
│   │   ├── page.tsx              # Página de login
│   │   └── actions.ts            # Server actions (usa UserService)
│   ├── signup/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard principal
│   ├── financeiro/
│   │   ├── page.tsx              # Página de transações
│   │   ├── actions.ts            # Server actions (usa TransactionService)
│   │   └── components/
│   │       ├── transaction-dialog.tsx
│   │       ├── transaction-table.tsx
│   │       └── ...
│   ├── categorias/
│   │   └── page.tsx
│   ├── orcamentos/
│   │   └── page.tsx
│   ├── lembretes/
│   │   └── page.tsx
│   ├── metas/
│   │   └── page.tsx
│   ├── relatorios/
│   │   └── page.tsx
│   ├── configuracoes/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── src/                          # Código fonte backend
│   └── modules/                  # Módulos organizados por domínio
│       ├── categories/
│       │   ├── category.schema.ts      # Validação Zod
│       │   ├── category.repository.ts  # Acesso ao DB
│       │   ├── category.service.ts     # Lógica de negócio
│       │   ├── category.routes.ts      # Handlers HTTP
│       │   └── index.ts
│       ├── transactions/
│       │   ├── transaction.schema.ts
│       │   ├── transaction.repository.ts
│       │   ├── transaction.service.ts
│       │   ├── transaction.routes.ts
│       │   └── index.ts
│       ├── user/
│       │   ├── user.schema.ts
│       │   ├── user.repository.ts
│       │   ├── user.service.ts
│       │   ├── user.routes.ts
│       │   └── index.ts
│       ├── README.md             # Documentação dos módulos
│       └── EXAMPLES.md           # Exemplos de uso
│
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── authenticated-layout.tsx
│   ├── sidebar.tsx
│   └── providers.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts
│   ├── utils.ts
│   └── recurring-utils.ts
│
├── types/
│   └── database.ts               # Tipos Supabase auto-gerados
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── seed.sql
│
└── ARCHITECTURE.md               # Este arquivo
```

## Camadas da Aplicação

### 1. Apresentação (Frontend)

**Tecnologias:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Shadcn/ui (Radix primitives)

**Responsabilidades:**
- Renderização de páginas
- Componentes UI
- Formulários e validação client-side
- Navegação

**Arquivos:**
- `app/**/*.tsx` - Páginas e componentes
- `components/**` - Componentes reutilizáveis

### 2. Server Actions (Camada de Interface - Web)

**Tecnologia:** Next.js Server Actions

**Responsabilidades:**
- Receber dados de formulários (FormData)
- Chamar Services
- Revalidar cache
- Redirecionar usuário

**Arquivos:**
- `app/**/actions.ts`

**Exemplo:**
```typescript
export async function createTransaction(formData: FormData) {
  const input = parseFormData(formData);
  await TransactionService.create(userId, input);
  revalidatePath("/financeiro");
}
```

### 3. API Routes (Camada de Interface - Mobile)

**Tecnologia:** Next.js Route Handlers

**Responsabilidades:**
- Receber requisições HTTP
- Autenticar requisições
- Validar entrada (Zod)
- Chamar Services
- Retornar JSON

**Arquivos:**
- `app/api/**/route.ts`

**Exemplo:**
```typescript
export async function POST(request: NextRequest) {
  const user = await getUser();
  const body = await request.json();
  const input = schema.parse(body);
  const result = await Service.create(user.id, input);
  return NextResponse.json({ data: result });
}
```

### 4. Service (Lógica de Negócio)

**Responsabilidades:**
- Implementar regras de negócio
- Validar dados (além da validação de schema)
- Orquestrar operações complexas
- Chamar Repositories

**Arquivos:**
- `src/modules/*/*.service.ts`

**Regras:**
- NUNCA chama Supabase diretamente
- SEMPRE chama Repositories
- Lança exceções em caso de erro

**Exemplo:**
```typescript
export class TransactionService {
  static async create(userId: string, input: CreateTransactionInput) {
    // Validação de negócio
    if (input.category_id) {
      const category = await CategoryRepository.findById(input.category_id);
      if (!category) throw new Error("Categoria inválida");
    }

    // Lógica de parcelamento
    if (input.installment_type === "parcelado") {
      return await this.createInstallments(userId, input);
    }

    // Criação simples
    return await TransactionRepository.create(userId, input);
  }
}
```

### 5. Repository (Acesso a Dados)

**Responsabilidades:**
- Executar queries no banco
- Mapear dados
- Tratar erros de DB

**Arquivos:**
- `src/modules/*/*.repository.ts`

**Regras:**
- ÚNICA camada que pode chamar Supabase
- Retorna tipos do banco (Database types)
- Lança exceções em erros de DB

**Exemplo:**
```typescript
export class TransactionRepository {
  static async findByUserId(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data;
  }
}
```

### 6. Schema (Validação)

**Tecnologia:** Zod

**Responsabilidades:**
- Definir schemas de validação
- Exportar tipos TypeScript

**Arquivos:**
- `src/modules/*/*.schema.ts`

**Exemplo:**
```typescript
export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
```

### 7. Database (Supabase PostgreSQL)

**Tabelas principais:**
- `users` - Perfis de usuários
- `categories` - Categorias de transações
- `transactions` - Transações financeiras
- `budgets` - Orçamentos (futuro)
- `reminders` - Lembretes (futuro)
- `goals` - Metas (futuro)

**Features:**
- Row Level Security (RLS)
- Triggers automáticos
- Políticas de acesso
- Tipos TypeScript auto-gerados

## Fluxo de Dados

### Web (Server Actions)

```
User Interaction
    ↓
Form Submit
    ↓
Server Action (app/*/actions.ts)
    ↓
Service (src/modules/*/service.ts)
    ↓
Repository (src/modules/*/repository.ts)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Response
    ↓
Revalidate Cache
    ↓
UI Update
```

### Mobile (API Routes)

```
HTTP Request
    ↓
API Route (app/api/*/route.ts)
    ↓
Authentication
    ↓
Schema Validation
    ↓
Service (src/modules/*/service.ts)
    ↓
Repository (src/modules/*/repository.ts)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
JSON Response
```

## Padrões de Design

### 1. Repository Pattern

Abstrai acesso ao banco de dados:

```typescript
// ✅ Correto
const user = await UserRepository.findById(userId);

// ❌ Errado
const { data } = await supabase.from("users").select("*").eq("id", userId);
```

### 2. Service Layer Pattern

Centraliza lógica de negócio:

```typescript
// ✅ Correto
await TransactionService.create(userId, input);

// ❌ Errado (lógica no controller)
const transaction = await supabase.from("transactions").insert(...);
if (transaction.type === "expense") { ... }
```

### 3. DTO (Data Transfer Object)

Usa schemas Zod para transferência de dados:

```typescript
// Input DTO
export const createCategorySchema = z.object({
  name: z.string(),
  color: z.string(),
});

// Validação
const input = createCategorySchema.parse(body);
```

### 4. Dependency Injection (implícito)

Services chamam Repositories:

```typescript
export class CategoryService {
  // Usa CategoryRepository implicitamente
  static async create(userId: string, input: CreateCategoryInput) {
    return await CategoryRepository.create(userId, input);
  }
}
```

## Princípios SOLID

### Single Responsibility Principle (SRP)

Cada classe/módulo tem uma responsabilidade:

- **Schema**: Validação
- **Repository**: Acesso a dados
- **Service**: Lógica de negócio
- **Routes**: Interface HTTP

### Open/Closed Principle (OCP)

Módulos abertos para extensão, fechados para modificação:

```typescript
// Adicionar nova validação sem modificar o service
export const createTransactionSchema = z.object({
  ...baseSchema,
  new_field: z.string(), // Extensão
});
```

### Liskov Substitution Principle (LSP)

Repositories podem ser substituídos (útil para testes):

```typescript
// Mock para testes
class MockTransactionRepository extends TransactionRepository {
  static async findByUserId() {
    return mockData;
  }
}
```

### Interface Segregation Principle (ISP)

Interfaces específicas para cada caso de uso:

```typescript
// Interface específica para criação
type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Interface específica para atualização
type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
```

### Dependency Inversion Principle (DIP)

Services dependem de abstrações (interfaces), não implementações:

```typescript
// Service depende da interface Repository, não da implementação Supabase
export class TransactionService {
  static async create(userId: string, input: CreateTransactionInput) {
    return await TransactionRepository.create(userId, input);
    // Não depende de Supabase diretamente
  }
}
```

## Benefícios da Arquitetura

### 1. Manutenibilidade

- Código organizado e fácil de encontrar
- Mudanças isoladas em camadas específicas
- Menos acoplamento entre componentes

### 2. Testabilidade

- Services podem ser testados mockando Repositories
- Validação separada da lógica de negócio
- Fácil criar dados de teste

### 3. Escalabilidade

- Fácil adicionar novos módulos
- Reutilização de código entre Web e Mobile
- Performance otimizada com cache

### 4. Segurança

- Autenticação centralizada
- Validação em múltiplas camadas
- Row Level Security no banco

### 5. Developer Experience

- TypeScript end-to-end
- Auto-complete e type safety
- Documentação clara e exemplos

## Próximos Passos

### Funcionalidades

- [ ] Módulo de orçamentos (budgets)
- [ ] Módulo de lembretes (reminders)
- [ ] Módulo de metas (goals)
- [ ] Módulo de relatórios (reports)
- [ ] Exportação de dados (CSV, PDF)
- [ ] Importação de OFX/CSV

### Melhorias Técnicas

- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes de integração (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoramento (Sentry)
- [ ] Analytics (PostHog)
- [ ] Cache Redis
- [ ] Background jobs (BullMQ)

### Mobile

- [ ] React Native app
- [ ] Expo setup
- [ ] Integração com APIs
- [ ] Notificações push
- [ ] Sincronização offline

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Zod Docs](https://zod.dev)
- [Shadcn/ui](https://ui.shadcn.com)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
