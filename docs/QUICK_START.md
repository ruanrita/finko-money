# Guia Rápido de Início 🚀

Este guia mostra como começar a usar a nova arquitetura modular **agora**.

## ✅ O que está pronto para usar

- ✅ **Autenticação completa** (Login, Signup, Logout)
- ✅ **CRUD de transações** (à vista, parceladas, recorrentes)
- ✅ **CRUD de categorias**
- ✅ **API REST completa** para mobile
- ✅ **Middleware configurado** (Web usa cookies, API usa tokens)

---

## 🎯 Para Continuar Desenvolvendo Web

### 1. Usar Services em Server Actions

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
    };

    await CategoryService.create(user.id, input);

    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
```

### 2. Chamar Services em Server Components

```typescript
// app/categorias/page.tsx
import { CategoryService } from "@/src/modules/categories";
import { createClient } from "@/lib/supabase/server";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Usar Service ao invés de query direta
  const categories = await CategoryService.list(user.id);

  return <CategoryList categories={categories} />;
}
```

### 3. Criar novos módulos

Siga o padrão em `src/modules/`:

```bash
mkdir -p src/modules/budgets
touch src/modules/budgets/budget.schema.ts
touch src/modules/budgets/budget.repository.ts
touch src/modules/budgets/budget.service.ts
touch src/modules/budgets/budget.routes.ts
touch src/modules/budgets/index.ts
```

Consulte: `src/modules/README.md` e `src/modules/EXAMPLES.md`

---

## 📱 Para Começar Desenvolvimento Mobile

### 1. Setup do Projeto Mobile

```bash
# React Native / Expo
npx create-expo-app finko-mobile
cd finko-mobile

# Instalar Supabase
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
```

### 2. Configurar Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
});
```

### 3. Implementar Login

```typescript
// screens/LoginScreen.tsx
import { supabase } from '@/lib/supabase';

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    Alert.alert('Erro', error.message);
    return;
  }

  // Supabase gerencia token automaticamente
  navigation.navigate('Dashboard');
};
```

### 4. Fazer Requisições Autenticadas

```typescript
// services/transactions.ts
import { supabase } from '@/lib/supabase';

export const getTransactions = async (filters?: any) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Não autenticado');
  }

  // Opção 1: Usar SDK do Supabase (recomendado)
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  // Opção 2: Usar API REST
  const response = await fetch(`${API_URL}/api/transactions`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  return result.data;
};
```

### 5. Criar Transação

```typescript
// Usar API REST
const createTransaction = async (input: CreateTransactionInput) => {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};

// Uso
await createTransaction({
  type: 'expense',
  amount: 100,
  description: 'Compra',
  due_date: '2025-01-15',
  installment_type: 'a_vista',
});
```

---

## 🧪 Testar APIs Agora

### Opção 1: REST Client (VS Code)

1. Instale a extensão **REST Client**
2. Abra `api-tests.http`
3. Clique em "Send Request" acima de cada requisição

```http
### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "123456"
}
```

### Opção 2: cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'

# Criar transação
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "expense",
    "amount": 100,
    "description": "Teste",
    "due_date": "2025-01-15",
    "installment_type": "a_vista"
  }'
```

### Opção 3: Postman/Insomnia

Importe as rotas de `api-tests.http`.

---

## 📚 Documentação

### Arquitetura
- **`ARCHITECTURE.md`** - Arquitetura completa e padrões de design
- **`REFACTORING_SUMMARY.md`** - Resumo da refatoração com exemplos

### Módulos
- **`src/modules/README.md`** - Como criar e usar módulos
- **`src/modules/EXAMPLES.md`** - Exemplos práticos de código

### Autenticação
- **`AUTHENTICATION.md`** - Web (cookies) vs API (tokens)
- **`MIDDLEWARE_UPDATE.md`** - Como o middleware foi ajustado

### CORS (Opcional)
- **`CORS_SETUP.md`** - Configurar CORS se necessário
- **`lib/cors.ts`** - Utilitários CORS prontos

### Testes
- **`api-tests.http`** - Testes HTTP para todas as rotas

### Migração
- **`MIGRATION_CHECKLIST.md`** - Migrar páginas existentes

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Gerar tipos Supabase
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > types/database.ts
```

---

## 📋 Checklist de Desenvolvimento

### Web
- [ ] Ler `ARCHITECTURE.md` para entender a estrutura
- [ ] Ler `src/modules/EXAMPLES.md` para ver exemplos
- [ ] Migrar páginas existentes usando `MIGRATION_CHECKLIST.md`
- [ ] Criar novos módulos seguindo padrão em `src/modules/README.md`
- [ ] Usar Services em Server Actions
- [ ] Usar Services em Server Components

### Mobile
- [ ] Criar projeto React Native / Expo
- [ ] Configurar Supabase client
- [ ] Implementar autenticação
- [ ] Consumir API REST (ver `AUTHENTICATION.md`)
- [ ] Testar endpoints com `api-tests.http`
- [ ] Implementar refresh token
- [ ] Implementar logout

---

## 💡 Exemplos Rápidos

### Criar transação parcelada (Web)

```typescript
// Server Action
const input: CreateTransactionInput = {
  type: 'expense',
  amount: 1200, // Valor TOTAL
  description: 'Notebook',
  due_date: '2025-01-10',
  installment_type: 'parcelado',
  installments_count: 12, // 12 parcelas de R$ 100
};

await TransactionService.create(userId, input);
// Cria automaticamente 12 transações
```

### Criar transação parcelada (Mobile)

```typescript
const response = await fetch(`${API_URL}/api/transactions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'expense',
    amount: 1200,
    description: 'Notebook',
    installment_type: 'parcelado',
    installments_count: 12,
  }),
});
```

### Filtrar transações

```typescript
// Web (Server Component)
const transactions = await TransactionService.list(userId, {
  type: 'expense',
  month: '2025-01',
  status: 'pending',
  category_id: 'uuid-da-categoria',
});

// Mobile (API)
const params = new URLSearchParams({
  type: 'expense',
  month: '2025-01',
  status: 'pending',
});

const response = await fetch(
  `${API_URL}/api/transactions?${params}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

---

## 🆘 Troubleshooting

### Erro: "Module not found"

**Causa:** Imports incorretos

**Solução:**
```typescript
// ✅ Correto
import { CategoryService } from "@/src/modules/categories";

// ❌ Errado
import { CategoryService } from "src/modules/categories";
```

### Erro: "Não autenticado" na API

**Causa:** Token não está sendo enviado

**Solução:**
```typescript
// Verificar header Authorization
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

### Middleware redirecionando rotas de API

**Causa:** Configuração incorreta do matcher

**Solução:** Já corrigido! Middleware agora exclui `/api/*`

---

## 🎉 Pronto para Começar!

Escolha seu caminho:

1. **Continuar Web:** Leia `MIGRATION_CHECKLIST.md` e migre páginas existentes
2. **Começar Mobile:** Leia `AUTHENTICATION.md` e configure o app mobile
3. **Criar Módulos:** Leia `src/modules/README.md` e crie novos módulos
4. **Testar APIs:** Abra `api-tests.http` e teste os endpoints

**Boa sorte no desenvolvimento! 🚀**
