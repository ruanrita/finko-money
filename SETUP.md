# 🚀 Setup do FinkoMoney

Guia completo para configurar e rodar o projeto FinkoMoney localmente.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### 1. **Node.js 18+**
```bash
node --version  # Deve ser 18.x ou superior
```
Download: https://nodejs.org/

### 2. **Docker Desktop**
O Supabase local depende do Docker para rodar.

Download: https://www.docker.com/products/docker-desktop/

### 3. **Supabase CLI**
```bash
npm install -g supabase
```

Verifique a instalação:
```bash
supabase --version
```

---

## 🔧 Instalação

### Passo 1: Clone o repositório
```bash
git clone https://github.com/seu-usuario/finkomoney.git
cd finkomoney
```

### Passo 2: Instale as dependências
```bash
npm install
```

### Passo 3: Configure o Supabase Local

#### 3.1 Inicie o Supabase
```bash
supabase start
```

Isso vai:
- Baixar as imagens Docker necessárias (primeira vez)
- Iniciar o PostgreSQL local
- Iniciar o Supabase Auth
- Iniciar a API REST
- Iniciar o Storage
- Iniciar o Supabase Studio

**⏱️ Aguarde alguns minutos na primeira execução**

#### 3.2 Copie as credenciais
Quando o comando terminar, ele vai exibir algo assim:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

### Passo 4: Configure as variáveis de ambiente

#### 4.1 Copie o arquivo de exemplo
```bash
cp env-example .env.local
```

#### 4.2 Edite o `.env.local`
Abra o arquivo `.env.local` e cole os valores do passo anterior:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Passo 5: Rode as migrações do banco de dados

As migrações já existem em `supabase/migrations/`, então basta aplicá-las:

```bash
supabase db reset
```

Isso vai:
- Resetar o banco de dados
- Rodar todas as migrações
- Criar as tabelas
- Configurar RLS (Row Level Security)
- Criar triggers e funções

### Passo 6: Inicie o Next.js

```bash
npm run dev
```

---

## 🌐 Acessando a Aplicação

Após seguir todos os passos, você terá acesso a:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **App Next.js** | http://localhost:3000 | Aplicação principal |
| **Supabase Studio** | http://localhost:54323 | Interface visual do banco |
| **Inbucket (Email)** | http://localhost:54324 | Caixa de entrada de emails locais |

---

## 📊 Explorando o Supabase Studio

Acesse http://localhost:54323 para:

- **Table Editor**: Ver e editar dados das tabelas
- **SQL Editor**: Rodar queries SQL
- **Database**: Ver schema, triggers, funções
- **Authentication**: Gerenciar usuários
- **Storage**: Arquivos (futuramente)

### Dados de acesso
Não precisa de senha, apenas clique em "Continue".

---

## ✅ Testando a Aplicação

### 1. Acesse a home
http://localhost:3000

Você deve ver a landing page do FinkoMoney.

### 2. Crie uma conta
- Clique em "Começar Grátis"
- Preencha o formulário de cadastro
- Você será redirecionado para o Dashboard

### 3. Explore o Dashboard
O dashboard vai mostrar:
- Resumo de receitas/despesas
- Saldo do mês
- Próximas transações

### 4. Veja os dados no Supabase Studio
- Acesse http://localhost:54323
- Vá em "Table Editor" → "users"
- Seu usuário deve estar lá!

---

## 🗂️ Estrutura do Projeto

```
finkomoney/
├── app/                    # Páginas Next.js (App Router)
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Layout raiz
│   ├── login/             # Página de login
│   ├── signup/            # Página de cadastro
│   └── dashboard/         # Dashboard principal
├── components/            # Componentes React
│   └── ui/               # Componentes de UI base
├── lib/                   # Bibliotecas e utilitários
│   ├── supabase/         # Cliente Supabase
│   └── utils.ts          # Funções utilitárias
├── types/                # Tipos TypeScript
│   └── database.ts       # Tipos do banco de dados
├── supabase/             # Configuração Supabase
│   ├── config.toml       # Config do Supabase local
│   └── migrations/       # Migrações SQL
├── docs/                 # Documentação do projeto
├── .env.local           # Variáveis de ambiente (não commitado)
├── env-example          # Exemplo de variáveis
└── middleware.ts        # Middleware de autenticação
```

---

## 🛠️ Comandos Úteis

### Supabase

```bash
# Iniciar Supabase local
supabase start

# Parar Supabase local
supabase stop

# Ver status
supabase status

# Resetar banco de dados
supabase db reset

# Ver logs
supabase logs

# Criar nova migration
supabase migration new nome_da_migration
```

### Next.js

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar produção localmente
npm start

# Lint
npm run lint
```

---

## 🐛 Troubleshooting

### Erro: "Docker not found"
**Solução:** Instale o Docker Desktop e certifique-se de que está rodando.

### Erro: "supabase: command not found"
**Solução:** Instale o Supabase CLI:
```bash
npm install -g supabase
```

### Erro: "Port 54321 already in use"
**Solução:** Pare o Supabase e inicie novamente:
```bash
supabase stop
supabase start
```

### Página em branco no Next.js
**Solução:** Verifique se o `.env.local` está configurado corretamente e reinicie o servidor:
```bash
# Ctrl+C para parar
npm run dev
```

### Erro de autenticação
**Solução:** Verifique se as migrações foram aplicadas:
```bash
supabase db reset
```

---

## 🚀 Próximos Passos

Agora que você configurou o projeto, você pode:

1. ✅ Explorar o código
2. ✅ Criar transações de teste
3. ✅ Adicionar categorias personalizadas
4. ✅ Implementar novas funcionalidades

Veja `INIT_PROGRESS.md` para saber o que já foi feito e o que falta implementar.

---

## 📚 Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

**Qualquer problema? Abra uma issue no GitHub!**
