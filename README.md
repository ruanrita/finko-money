# 📘 README.md — FinkoMoney

# 💰 FinkoMoney — Personal Finance Management App

FinkoMoney é um gerenciador financeiro minimalista, moderno e focado em privacidade, projetado para ajudar usuários a consolidar despesas de múltiplos bancos, controlar pagamentos recorrentes, definir lembretes e ter visibilidade clara de compromissos financeiros futuros.

O objetivo é simples: **colocar toda sua vida financeira em um só lugar, sem complexidade.**

---

## 🚀 Tech Stack

Este projeto usa uma stack leve e moderna ideal para bootstrapping de SaaS:

### **Frontend**
- **Next.js 14 (App Router)**
- **React + TypeScript**
- **TailwindCSS**

### **Backend / Infra**
- **Supabase (Local + Cloud Ready)**
  - Banco de dados Postgres
  - Auth
  - REST API
  - Edge Functions (opcional)
  - Storage (compatível S3 local)
- **Supabase CLI** para desenvolvimento local
- **Netlify** para deploy do frontend

---

## 📦 Funcionalidades (MVP)

- Cadastro de despesas pontuais ou recorrentes
- População automática de contas recorrentes para próximos meses
- Lembretes personalizados para vencimentos
- Dashboard com resumo mensal
- Categorização de despesas
- Registro manual de receitas e despesas
- (Futuro) Conexão com bancos – Open Finance
- (Futuro) Notificações & automações
- (Futuro) Multi-moeda

---

## 🧱 Estrutura do Projeto

```
/
├─ app/             # Páginas do Next.js (App Router)
├─ components/      # Componentes de UI React
├─ lib/             # Cliente Supabase, utilitários
├─ Docs/            # Branding, guias de infra, documentação
├─ supabase/        # Configuração, migrações e seeds do Supabase
├─ .env.local       # Variáveis de ambiente locais
```

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

## 📘 Notas

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

- UX redesign
- Sistema de notificações
- Importação de transações via Open Finance
- Ferramentas de orçamento
- Categorização de gastos com IA
- Mobile PWA
- Plano de assinaturas (Freemium → Plus)