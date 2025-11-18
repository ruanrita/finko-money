# 🌱 Como Aplicar os Seeds

## Forma Simplificada (Recomendada)

Agora o seed cria **TUDO automaticamente**, incluindo o usuário de teste!

### Passo Único:

```bash
supabase db reset
```

Pronto! O seed vai criar:
- ✅ Usuário de teste em `auth.users`
- ✅ Registro em `public.users`
- ✅ 7 categorias personalizadas
- ✅ 1 receita + 6 despesas

---

## 🔐 Credenciais de Teste

Após executar `supabase db reset`, faça login com:

- **Email**: `teste@finko.com`
- **Senha**: `teste123`

---

## 📊 O Que Será Criado:

### 👤 Usuário de Teste
- Email: teste@finko.com
- Senha: teste123
- Criado automaticamente em `auth.users` e `public.users`

### 🏷️ Categorias (7 no total)
1. Salário (verde)
2. Moradia (vermelho)
3. Alimentação (laranja)
4. Transporte (azul)
5. Lazer (roxo)
6. Saúde (rosa)
7. Educação (ciano)

### 💰 Transações (7 no total)

#### 1. RECEITA - Salário
- Valor: R$ 5.500,00
- Status: ✅ Pago
- Recorrente: Sim (mensal)
- Aparece todo dia 5 de cada mês

#### 2. DESPESA - Aluguel
- Valor: R$ 1.800,00
- Status: ⏳ Pendente
- Recorrente: Sim (mensal)
- Aparece todo dia 10 de cada mês

#### 3. DESPESA - Netflix
- Valor: R$ 49,90
- Status: ⏳ Pendente
- Recorrente: Sim (mensal)
- Aparece todo dia 15 de cada mês

#### 4. DESPESA - Notebook
- Valor: R$ 291,67 (1/12)
- Status: ⏳ Pendente
- Parcelado: Sim (12x de R$ 291,67)
- Método: Cartão de Crédito

#### 5. DESPESA - Mercado
- Valor: R$ 450,00
- Status: ✅ Pago
- Parcelado: Não (à vista)
- Método: Cartão de Débito

#### 6. DESPESA - Uber
- Valor: R$ 85,50
- Status: ✅ Pago
- Parcelado: Não (à vista)
- Método: Cartão de Crédito

#### 7. DESPESA - Plano de Saúde
- Valor: R$ 380,00
- Status: ⏳ Pendente
- Parcelado: Não (à vista)
- Método: Boleto

---

## 📈 Resumo Financeiro do Mês

Com os dados de seed, você terá:

- **💰 Receitas**: R$ 5.500,00
- **💸 Despesas**: R$ 3.057,07
- **✅ Saldo**: +R$ 2.442,93

---

## 🔄 Testando Transações Recorrentes

Após fazer login, você pode testar o sistema de recorrência:

1. Acesse `/financeiro`
2. Use os botões **← →** para navegar entre os meses
3. Observe que **Salário**, **Aluguel** e **Netflix** aparecem em **todos os meses**
4. As transações recorrentes têm o ícone 🔄 e a tag "(Virtual)"

---

## 🧹 Limpar Dados (Opcional)

Para resetar o banco completamente:

```bash
supabase db reset
```

Isso vai:
- Deletar todos os dados
- Recriar o schema
- Executar o seed novamente
- Criar o usuário de teste novamente

---

## 🚀 Início Rápido Completo

```bash
# 1. Reset do banco (cria tudo)
supabase db reset

# 2. Iniciar o projeto
npm run dev

# 3. Acessar
# http://localhost:3000/login

# 4. Login
# Email: teste@finko.com
# Senha: teste123
```

**Pronto para usar!** 🎉
