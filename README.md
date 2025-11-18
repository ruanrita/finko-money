# 📘 README.md — FinkoMoney

# 💰 FinkoMoney — Personal Finance Management App

FinkoMoney é um gerenciador financeiro minimalista, moderno e focado em privacidade, projetado para ajudar usuários a consolidar despesas de múltiplos bancos, controlar pagamentos recorrentes, definir lembretes e ter visibilidade clara de compromissos financeiros futuros.

O objetivo é simples: **colocar toda sua vida financeira em um só lugar, sem complexidade.**

---

## 🚀 Tech Stack

Este projeto usa uma stack leve e moderna ideal para bootstrapping de SaaS:

### **Frontend**
- **Next.js 16 (App Router)**
- **React 19 + TypeScript**
- **TailwindCSS 4**
- **Shadcn/ui** (Radix UI)
- **Recharts** (Gráficos)

### **Backend / Infra**
- **Supabase (PostgreSQL)**
  - Banco de dados Postgres
  - Auth (JWT + Session)
  - Row Level Security (RLS)
  - Auto-generated TypeScript types
- **Arquitetura Modular**
  - Service Layer (Lógica de negócio)
  - Repository Pattern (Acesso a dados)
  - Schema Validation (Zod)
  - API REST (para mobile)
- **Supabase CLI** para desenvolvimento local
- **Vercel/Netlify** para deploy

---

## 📦 Funcionalidades Implementadas

### ✅ Autenticação
- Login/Signup com Supabase Auth
- Perfil de usuário
- Alterar senha
- Reset de senha
- Logout

### ✅ Transações
- Cadastro de receitas e despesas
- **Transações parceladas** (divide valor em N parcelas automaticamente)
- **Transações recorrentes** (mensal/semanal/anual)
- Marcar como pago/não pago
- Filtros avançados (tipo, categoria, status, mês, método)
- Tags personalizadas
- Métodos de pagamento

### ✅ Categorias
- CRUD completo de categorias
- Cores e ícones personalizados
- Categorias padrão criadas automaticamente

### ✅ Dashboard
- Resumo mensal (receitas, despesas, saldo)
- Gráficos de evolução
- Filtro por período

### ✅ API REST
- **Endpoints completos** para consumo mobile
- Autenticação JWT
- Validação com Zod
- Documentação em `api-tests.http`

### 🚧 Em Desenvolvimento
- Orçamentos (Budgets)
- Lembretes (Reminders)
- Metas (Goals)
- Relatórios avançados

### 🔮 Futuro
- Conexão com bancos (Open Finance)
- Notificações push
- Importar/Exportar dados (CSV, OFX)
- App Mobile (React Native)
- Multi-moeda

---

## 🧱 Estrutura do Projeto

```
finko-money/
├── app/                     # Next.js App Router
│   ├── api/                 # API REST (para mobile)
│   │   ├── auth/            # Login, signup, logout
│   │   ├── categories/      # CRUD categorias
│   │   ├── transactions/    # CRUD transações
│   │   └── user/            # Perfil, senha
│   ├── dashboard/           # Dashboard principal
│   ├── financeiro/          # Gestão de transações
│   ├── categorias/          # Gestão de categorias
│   └── login/               # Autenticação
│
├── src/modules/             # ⭐ Backend modular
│   ├── categories/          # Módulo de categorias
│   │   ├── category.schema.ts
│   │   ├── category.repository.ts
│   │   ├── category.service.ts
│   │   └── category.routes.ts
│   ├── transactions/        # Módulo de transações
│   └── user/                # Módulo de usuário/auth
│
├── components/              # Componentes reutilizáveis UI
├── lib/                     # Supabase client, utilitários
├── types/                   # Tipos TypeScript (database)
├── supabase/                # Migrações e seeds
├── docs/                    # Documentação
└── .env.local               # Variáveis de ambiente
```

### 🎯 Arquitetura Modular

Cada módulo segue o padrão de **camadas**:

1. **Schema** (Zod) - Validação de entrada/saída
2. **Repository** - Acesso ao banco de dados
3. **Service** - Lógica de negócio
4. **Routes** - Handlers HTTP (API)

**Benefícios:**
- ✅ Separação frontend/backend clara
- ✅ Reutilização de código (Web + Mobile)
- ✅ Fácil de testar e manter
- ✅ TypeScript end-to-end
- ✅ Escalável

---

## 🔧 Requisitos

Antes de rodar o projeto, instale:

### **Node.js 18+**
[https://nodejs.org/](https://nodejs.org/)

### **Supabase CLI**
```sh
npm install -g supabase
```

### **Docker Desktop**
Supabase local depende do Docker.

---

## ▶️ Como rodar o projeto localmente

Siga os passos abaixo para configurar tudo do zero.

---

### 1️⃣ Clone o repositório
```sh
git clone https://github.com/your-user/finkomoney.git
cd finkomoney
```

### 2️⃣ Instale as dependências
```sh
npm install
```

### 3️⃣ Inicie o Supabase local

Isso inicializa o Postgres local, Auth, API e Storage.

```sh
supabase start
```

Este comando irá gerar variáveis de ambiente como:

```
SUPABASE_SERVICE_API_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_Database_URL=postgres://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_SERVICE_Publishable_key=sb_publishable_xxx
SUPABASE_SERVICE_Secret_key=sb_secret_xxx
```

### 4️⃣ Crie o arquivo `.env.local`

No diretório raiz do projeto:
```sh
cp .env.example .env.local
```

Depois, cole os valores que o Supabase gerou:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx

SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 5️⃣ Rode as migrações do banco

Se já houver migrações:
```sh
supabase migration up
```

Para criar uma nova:
```sh
supabase migration new init
```

### 6️⃣ Inicie o app
```sh
npm run dev
```

Seu app estará disponível em:
👉 http://localhost:3000

O Supabase Studio local:
👉 http://localhost:54323

---

## 📡 API REST

### Endpoints Disponíveis

#### Autenticação
```http
POST   /api/auth/login        # Login
POST   /api/auth/signup       # Cadastro
POST   /api/auth/logout       # Logout
POST   /api/auth/reset-password
```

#### Categorias
```http
GET    /api/categories        # Listar
POST   /api/categories        # Criar
PATCH  /api/categories/:id    # Atualizar
DELETE /api/categories/:id    # Deletar
```

#### Transações
```http
GET    /api/transactions      # Listar (com filtros)
POST   /api/transactions      # Criar (à vista ou parcelada)
PATCH  /api/transactions/:id  # Atualizar
DELETE /api/transactions/:id  # Deletar
POST   /api/transactions/:id/mark-paid
POST   /api/transactions/:id/mark-unpaid
```

#### Usuário
```http
GET    /api/user/profile      # Buscar perfil
PATCH  /api/user/profile      # Atualizar perfil
POST   /api/user/change-password
DELETE /api/user              # Deletar conta
```

### 🧪 Testando as APIs

Use o arquivo `api-tests.http` com a extensão **REST Client** do VS Code:

```http
### Criar transação parcelada
POST http://localhost:3000/api/transactions
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "type": "expense",
  "amount": 1200,
  "description": "Notebook",
  "due_date": "2025-01-10",
  "installment_type": "parcelado",
  "installments_count": 12
}
```

### 📱 Mobile (React Native)

```typescript
const response = await fetch('https://app.com/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'expense',
    amount: 100,
    description: 'Compra',
    installment_type: 'a_vista'
  })
});
```

---

## 🌐 Deploy (Frontend)

Você pode fazer o deploy do Next.js facilmente pela Netlify:

- Conecte o repositório do GitHub
- Defina o comando de build:
  ```sh
  npm run build
  ```
- Adicione as variáveis de ambiente (do Supabase Cloud, não as locais)
- Diretório de publicação:
  ```
  .next
  ```

---

## 📚 Documentação Completa

### 🚀 Para Começar
- **[QUICK_START.md](./docs/QUICK_START.md)** - **Comece aqui!** Guia rápido para usar a nova arquitetura

### 🏗️ Arquitetura
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitetura completa e padrões de design
- **[REFACTORING_SUMMARY.md](./docs/REFACTORING_SUMMARY.md)** - Resumo da refatoração com exemplos

### 📦 Módulos
- **[src/modules/README.md](./src/modules/README.md)** - Como criar e usar módulos
- **[src/modules/EXAMPLES.md](./src/modules/EXAMPLES.md)** - Exemplos práticos de código

### 🔐 Autenticação
- **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Web (cookies) vs API (tokens)
- **[MIDDLEWARE_UPDATE.md](./docs/MIDDLEWARE_UPDATE.md)** - Como o middleware foi ajustado

### 🌐 CORS (Opcional)
- **[CORS_SETUP.md](./docs/CORS_SETUP.md)** - Configurar CORS se necessário
- **[lib/cors.ts](./lib/cors.ts)** - Utilitários CORS reutilizáveis

### 🧪 Testes
- **[api-tests.http](./docs/api-tests.http)** - Testes HTTP para todas as rotas (REST Client)

### 🔄 Migração
- **[MIGRATION_CHECKLIST.md](./docs/MIGRATION_CHECKLIST.md)** - Guia para migrar páginas existentes

### 📑 Outros
- **[INDEX.md](./docs/INDEX.md)** - Índice completo de toda documentação
- **[CHANGES_SUMMARY.md](./docs/CHANGES_SUMMARY.md)** - Resumo visual de todas as mudanças

### 📘 Notas

**Supabase Local vs Cloud:**
Para desenvolvimento use os valores gerados por:
```sh
supabase start
```

Para produção, substitua:

- URL
- ANON KEY
- SERVICE KEY

Pelos valores do seu projeto no [Supabase Cloud](https://supabase.com/).

---

## 📄 Licença

Este projeto está sob a [MIT License](LICENSE), permitindo uso comercial e pessoal livremente.

---

## 🎯 Roadmap

### Em Desenvolvimento
- [x] ✅ Autenticação completa
- [x] ✅ CRUD de transações
- [x] ✅ Parcelamento automático
- [x] ✅ Recorrência
- [x] ✅ Dashboard
- [x] ✅ Categorias
- [x] ✅ API REST completa
- [x] ✅ Arquitetura modular

### Próximos Passos
- [ ] Orçamentos (Budgets)
- [ ] Lembretes (Reminders)
- [ ] Metas (Goals)
- [ ] Relatórios avançados
- [ ] Exportar/Importar dados (CSV, OFX)
- [ ] App Mobile (React Native/Expo)
- [ ] Notificações push
- [ ] Webhooks
- [ ] Open Finance (integração bancária)
- [ ] Categorização com IA
- [ ] Plano de assinaturas

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ usando Next.js 16, React 19 e Supabase**