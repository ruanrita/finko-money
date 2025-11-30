# Módulo de Emails

Módulo completo para envio de emails usando Resend.

## 📁 Estrutura

```
emails/
├── views/                      # Templates de email (React/TSX)
│   ├── welcome-email.tsx
│   ├── password-reset-email.tsx
│   ├── transaction-confirmation-email.tsx
│   ├── payment-reminder-email.tsx
│   └── index.ts
├── email.config.ts            # Configuração do Resend
├── email.schema.ts            # Schemas de validação (Zod)
├── email.service.ts           # Serviço de envio de emails
├── index.ts                   # Exportações do módulo
└── README.md                  # Esta documentação
```

## 🚀 Instalação

O módulo já está pronto para uso. Certifique-se de configurar as variáveis de ambiente:

```env
# Chave da API do Resend (obrigatório)
RESEND_API_KEY=re_xxxxxxxxxxxxxx

# Email do remetente (opcional - padrão: noreply@finkomoney.com)
EMAIL_FROM=noreply@finkomoney.com

# Email de resposta (opcional - padrão: support@finkomoney.com)
EMAIL_REPLY_TO=support@finkomoney.com

# URL da aplicação (usado nos links dos emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📧 Tipos de Email

### 1. Email de Boas-vindas

Enviado quando um novo usuário se cadastra.

```typescript
import { EmailService } from "@/src/modules/emails";

await EmailService.sendWelcomeEmail({
  to: "usuario@email.com",
  userName: "João Silva",
});
```

### 2. Email de Redefinição de Senha

Enviado quando o usuário solicita redefinição de senha.

```typescript
await EmailService.sendPasswordResetEmail({
  to: "usuario@email.com",
  userName: "João Silva",
  resetLink: "https://app.com/reset-password?token=abc123",
});
```

### 3. Email de Confirmação de Transação

Enviado quando uma transação é criada.

```typescript
await EmailService.sendTransactionConfirmationEmail({
  to: "usuario@email.com",
  userName: "João Silva",
  transactionType: "expense",
  amount: 150.00,
  description: "Conta de luz",
  date: new Date(),
});
```

### 4. Email de Lembrete de Pagamento

Enviado para lembrar pagamentos próximos do vencimento.

```typescript
await EmailService.sendPaymentReminderEmail({
  to: "usuario@email.com",
  userName: "João Silva",
  transactions: [
    {
      description: "Conta de luz",
      amount: 150.00,
      dueDate: new Date("2025-12-15"),
    },
    {
      description: "Internet",
      amount: 99.90,
      dueDate: new Date("2025-12-20"),
    },
  ],
});
```

## 🛠️ Envio Customizado

### Email HTML Genérico

```typescript
await EmailService.sendHtmlEmail({
  to: "usuario@email.com",
  subject: "Assunto do Email",
  html: "<h1>Olá!</h1><p>Conteúdo do email em HTML</p>",
  text: "Versão em texto plano (opcional)",
});
```

### Email com Componente React Customizado

```typescript
import { MyCustomEmailTemplate } from "./my-template";

await EmailService.sendReactEmail({
  to: "usuario@email.com",
  subject: "Assunto do Email",
  react: MyCustomEmailTemplate({ prop1: "valor" }),
});
```

## 📝 Criando Novos Templates

1. Crie um novo arquivo em `views/`:

```typescript
// views/my-new-email.tsx
import * as React from "react";

interface MyEmailProps {
  userName: string;
  customData: string;
}

export const MyEmailTemplate: React.FC<MyEmailProps> = ({
  userName,
  customData,
}) => {
  return (
    <div style={styles.container}>
      <h1>Olá, {userName}!</h1>
      <p>{customData}</p>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
  },
};
```

2. Adicione a exportação em `views/index.ts`:

```typescript
export { MyEmailTemplate } from "./my-new-email";
```

3. Crie um schema de validação em `email.schema.ts`:

```typescript
export const myEmailSchema = z.object({
  to: z.string().email(),
  userName: z.string().min(1),
  customData: z.string(),
});

export type MyEmailInput = z.infer<typeof myEmailSchema>;
```

4. Adicione um método no serviço `email.service.ts`:

```typescript
static async sendMyEmail(input: MyEmailInput) {
  const validated = myEmailSchema.parse(input);

  return this.sendReactEmail({
    to: validated.to,
    subject: "Título do Email",
    react: MyEmailTemplate({
      userName: validated.userName,
      customData: validated.customData,
    }),
  });
}
```

## 🔍 Validação

Todos os inputs são validados usando Zod. Se os dados forem inválidos, um erro será lançado automaticamente.

## 🧪 Modo de Desenvolvimento

Em desenvolvimento (`NODE_ENV=development`), os emails são logados no console para facilitar o debug.

## ⚠️ Tratamento de Erros

Todos os métodos de envio retornam um objeto com `success` e `error`:

```typescript
const result = await EmailService.sendWelcomeEmail({
  to: "usuario@email.com",
  userName: "João Silva",
});

if (result.success) {
  console.log("Email enviado com sucesso!");
} else {
  console.error("Erro ao enviar email:", result.error);
}
```

## 🔄 Retry Automático

O serviço possui retry automático configurado:
- Máximo de 3 tentativas
- Delay de 1 segundo entre tentativas

## 📚 Recursos

- [Documentação do Resend](https://resend.com/docs)
- [Templates de Email com React](https://resend.com/docs/send-with-react)
