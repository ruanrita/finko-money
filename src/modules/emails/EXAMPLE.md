# Exemplos de Uso do Módulo de Emails

## 1. Enviar Email de Boas-vindas após Cadastro

```typescript
// app/auth/signup/actions.ts
"use server";

import { EmailService } from "@/src/modules/emails";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  // Criar usuário
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Enviar email de boas-vindas
  await EmailService.sendWelcomeEmail({
    to: email,
    userName: name,
  });

  return { success: true };
}
```

## 2. Enviar Email de Confirmação ao Criar Transação

```typescript
// app/financeiro/actions.ts
"use server";

import { EmailService } from "@/src/modules/emails";
import { TransactionService } from "@/src/modules/transactions";
import { createClient } from "@/lib/supabase/server";

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // Criar transação
  const transaction = await TransactionService.create(
    user.id,
    branchId,
    input
  );

  // Enviar email de confirmação
  const userEmail = user.email;
  const userName = user.user_metadata?.name || "Usuário";

  await EmailService.sendTransactionConfirmationEmail({
    to: userEmail,
    userName: userName,
    transactionType: input.type,
    amount: input.amount,
    description: input.description,
    date: input.due_date,
  });

  return { success: true };
}
```

## 3. Enviar Lembretes de Pagamento (Cron Job)

```typescript
// app/api/cron/payment-reminders/route.ts
import { NextResponse } from "next/server";
import { EmailService } from "@/src/modules/emails";
import { createClient } from "@/lib/supabase/server";
import { addDays, startOfDay } from "date-fns";

export async function GET(request: Request) {
  // Verificar autenticação do cron (exemplo com token)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Buscar transações que vencem nos próximos 3 dias
  const today = startOfDay(new Date());
  const threeDaysFromNow = addDays(today, 3);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, user:user_id(email, user_metadata)")
    .is("paid_at", null)
    .gte("due_date", today.toISOString())
    .lte("due_date", threeDaysFromNow.toISOString());

  if (!transactions) {
    return NextResponse.json({ message: "No transactions found" });
  }

  // Agrupar transações por usuário
  const userTransactions = new Map();

  transactions.forEach((t) => {
    const userId = t.user_id;
    if (!userTransactions.has(userId)) {
      userTransactions.set(userId, {
        user: t.user,
        transactions: [],
      });
    }
    userTransactions.get(userId).transactions.push({
      description: t.description,
      amount: t.amount,
      dueDate: t.due_date,
    });
  });

  // Enviar email para cada usuário
  const emailPromises = Array.from(userTransactions.values()).map(
    ({ user, transactions }) => {
      return EmailService.sendPaymentReminderEmail({
        to: user.email,
        userName: user.user_metadata?.name || "Usuário",
        transactions: transactions,
      });
    }
  );

  await Promise.all(emailPromises);

  return NextResponse.json({
    message: "Reminders sent",
    count: emailPromises.length,
  });
}
```

## 4. Enviar Email de Redefinição de Senha

```typescript
// app/auth/forgot-password/actions.ts
"use server";

import { EmailService } from "@/src/modules/emails";
import { createClient } from "@/lib/supabase/server";

export async function sendPasswordResetEmail(email: string) {
  const supabase = await createClient();

  // Buscar usuário
  const { data: user } = await supabase
    .from("users")
    .select("email, user_metadata")
    .eq("email", email)
    .single();

  if (!user) {
    // Não revelar se o email existe ou não (segurança)
    return { success: true };
  }

  // Gerar token de redefinição
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  // Enviar email com link de redefinição
  await EmailService.sendPasswordResetEmail({
    to: email,
    userName: user.user_metadata?.name || "Usuário",
    resetLink: data?.properties?.action_link || "",
  });

  return { success: true };
}
```

## 5. Email Customizado com HTML

```typescript
import { EmailService } from "@/src/modules/emails";

async function sendCustomEmail() {
  await EmailService.sendHtmlEmail({
    to: "usuario@email.com",
    subject: "Notificação Importante",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Título</h1>
        <p>Seu conteúdo personalizado aqui.</p>
        <a href="https://seusite.com" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Clique Aqui
        </a>
      </div>
    `,
    text: "Versão em texto plano para clientes que não suportam HTML",
  });
}
```

## 6. Configurar Cron Job no Vercel

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Isso executará o cron de lembretes todos os dias às 9:00 AM.

## 7. Testar Envio de Email em Desenvolvimento

```typescript
// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { EmailService } from "@/src/modules/emails";

export async function GET() {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only in development" }, { status: 403 });
  }

  const result = await EmailService.sendWelcomeEmail({
    to: "seu-email@test.com",
    userName: "Teste",
  });

  return NextResponse.json(result);
}
```

Acesse: `http://localhost:3000/api/test-email`

## Observações

- Todos os métodos retornam `{ success: boolean, error?: string, data?: any }`
- Em desenvolvimento, os emails são logados no console
- Use variáveis de ambiente para configurar o Resend
- Sempre valide os dados de entrada antes de enviar emails
