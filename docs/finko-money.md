## 🧩 1. O que é o FinkoMoney — descrição clara

O **FinkoMoney** é um sistema de gestão financeira pessoal que centraliza todas as despesas mensais, fixas e variáveis, criando uma visão clara do que o usuário deve hoje e do que vai dever no próximo mês — sem precisar abrir aplicativos de bancos ou anotar nada manualmente.

Ele ajuda o usuário a:

- Registrar despesas
- Identificar gastos recorrentes
- Prever o orçamento do próximo mês
- Receber alertas de pagamento
- Evitar atrasos e juros
- Ter controle financeiro simples, visual e direto

---

## 🚨 2. Problema real que o app resolve

O usuário comum tem:

- **3 a 7 bancos/apps financeiros** (Nubank, PicPay, Itaú, Mercado Pago, Neon…)
- **Assinaturas em múltiplas plataformas** (Netflix, Spotify, Amazon…)
- **Contas fixas que esquecem** (água, luz, aluguel…)
- **Despesas que mudam mês a mês**

Falta de clareza sobre:

- “Quanto vou gastar no próximo mês?”
- “Qual é o total das minhas assinaturas?”
- “Qual é a minha despesa real mensal?”
- “O que vence amanhã?”

O **FinkoMoney** unifica isso.

---

## 🎯 3. Proposta de valor (frase forte)

> **FinkoMoney — Toda a sua vida financeira, organizada em um único lugar.**

---

## ⚙️ 4. Funcionalidades essenciais (MVP competitivo)

Estas funcionalidades são necessárias para competir com apps como Organizze, Mobills, Olivia e MinhasEconomias:

1. **Cadastro de despesas**
   - Informar valor
   - Categoria
   - Data de vencimento
   - Forma de pagamento
   - Tags opcionais
   - Anexar comprovante (mais tarde)
2. **Despesas recorrentes**
   - Mensal / semanal / anual
   - Recorrência automática nos meses seguintes
   - Possibilidade de editar apenas uma entrada ou todas
3. **Visão mensal do orçamento**
   - Uma tela tipo calendário ou lista mostrando:
     - Total do mês atual
     - Total do próximo mês
     - Contas vencidas
     - Contas próximas
     - Assinaturas
     - Gastos variáveis
4. **Notificações**
   - Lembrete um dia antes do vencimento
   - Lembrete no dia
   - Notificação de “mês virou: veja seus gastos previstos”
5. **Controle simples de receitas**
   - Salário
   - Entradas variáveis
   - Balanço do mês
   - Quanto sobra após pagar tudo
6. **Painel geral**
   - Saldo planejado
   - Percentual do salário comprometido
   - Assinaturas totais
   - Média de gastos dos últimos 3 meses
7. **Backup na nuvem (Supabase)**
   - Login + sincronização entre dispositivos

---

## 🚀 5. Funcionalidades evoluídas (para se destacar no mercado)

Essas elevam o app acima dos concorrentes:

- ⭐ **Recomendações financeiras por IA**
  - “Se cancelar X você economiza Y por mês”
  - “Suas assinaturas representam 27% da sua renda”
  - “Você ultrapassou sua média de gastos em alimentação”
- ⭐ **Metas financeiras**
  - Meta mensal de gastos
  - Meta de economia
  - Acompanhamento automático
- ⭐ **Previsão automática (machine learning simples)**
  - “Com base nos seus gastos dos últimos 6 meses, você gastará R$ 2.300 em janeiro.”
- ⭐ **Importação via CSV / PDF de fatura de cartão**
  - (Melhora muito a vida do usuário)
- ⭐ **Multimoeda (para EUA)**
  - Dólar / real / euro (expansão futura)

---

## 🔌 6. Conexão com bancos — o que é possível

No Brasil, Open Finance / Open Banking permite conectar bancos de forma oficial.

### O que é possível obter quando integrar (não no MVP):

- Saldos de todas as contas
- Transações dos últimos meses
- Cartões de crédito e limites
- Faturas
- Categorias de gastos
- Identificação automática de assinaturas

### Como conectar

Você precisa de um provedor Open Banking, como:

- Belvo
- Pluggy
- TecBan
- Klavi
- Paggue

Eles cuidam de:

- Consentimento do usuário
- Integração com bancos
- Segurança e criptografia
- APIs para buscar dados financeiros

Você só consome a API deles.

> **❗ Custos:**
> R$ 0,20 a R$ 1,50 por “sincronização” por usuário
> → Não vale a pena no MVP.

---

## 🧠 7. Outras dores financeiras que o app pode resolver

Aqui estão dores comuns dos brasileiros e americanos:

### 🇧🇷 Brasil

- Esquecer conta de água/energia/aluguel
- Esquecer fatura do cartão e pagar juros
- Dificuldade com vários apps bancários
- Não saber “quanto realmente custa viver”
- Perder controle das assinaturas

### 🇺🇸 EUA

- Vários cartões de crédito diferentes
- Juros altíssimos por atraso (APR)
- Subscriptions escondidas
- Pagamentos em auto-debit difíceis de rastrear
- Pouca visão de “próximo mês”
