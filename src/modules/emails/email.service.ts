import { resend, emailConfig } from "./email.config";
import { EmailLogRepository } from "../email-logs";
import type {
  SendHtmlEmailInput,
  SendReactEmailInput,
  WelcomeEmailInput,
  PasswordResetEmailInput,
  TransactionConfirmationEmailInput,
  PaymentReminderEmailInput,
  TwoFactorEmailInput,
} from "./email.schema";
import {
  sendHtmlEmailSchema,
  sendReactEmailSchema,
  welcomeEmailSchema,
  passwordResetEmailSchema,
  transactionConfirmationEmailSchema,
  paymentReminderEmailSchema,
  twoFactorEmailSchema,
} from "./email.schema";
import {
  WelcomeEmailTemplate,
  PasswordResetEmailTemplate,
  TransactionConfirmationEmailTemplate,
  PaymentReminderEmailTemplate,
  TwoFactorEmailTemplate,
} from "./views";

export class EmailService {
  /**
   * Envia um email HTML genérico
   */
  static async sendHtmlEmail(
    input: SendHtmlEmailInput,
    options?: { userId?: string; emailType?: string; metadata?: Record<string, any> }
  ) {
    const validated = sendHtmlEmailSchema.parse(input);

    // Cria log inicial
    const emailTo = Array.isArray(validated.to) ? validated.to[0] : validated.to;
    const emailLog = await EmailLogRepository.create({
      user_id: options?.userId,
      email_to: emailTo,
      email_type: options?.emailType || "html",
      subject: validated.subject,
      status: "pending",
      metadata: options?.metadata,
    });

    try {
      const result = await resend.emails.send({
        from: validated.from || emailConfig.from,
        to: validated.to,
        subject: validated.subject,
        html: validated.html,
        text: validated.text,
        replyTo: validated.replyTo || emailConfig.replyTo,
      });

      // Atualiza log como enviado
      await EmailLogRepository.markAsSent(emailLog.id, result.data?.id);

      if (emailConfig.isDevelopment) {
        console.log("[Email] Email HTML enviado:", {
          to: validated.to,
          subject: validated.subject,
          result,
        });
      }

      return { success: true, data: result };
    } catch (error) {
      // Atualiza log como falha
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar email";
      await EmailLogRepository.markAsFailed(emailLog.id, errorMessage);

      console.error("[Email] Erro ao enviar email HTML:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envia um email usando um componente React
   */
  static async sendReactEmail(
    input: SendReactEmailInput,
    options?: { userId?: string; emailType?: string; metadata?: Record<string, any> }
  ) {
    const validated = sendReactEmailSchema.parse(input);

    // Cria log inicial
    const emailTo = Array.isArray(validated.to) ? validated.to[0] : validated.to;
    const emailLog = await EmailLogRepository.create({
      user_id: options?.userId,
      email_to: emailTo,
      email_type: options?.emailType || "react",
      subject: validated.subject,
      status: "pending",
      metadata: options?.metadata,
    });

    try {
      const result = await resend.emails.send({
        from: validated.from || emailConfig.from,
        to: validated.to,
        subject: validated.subject,
        react: validated.react,
        replyTo: validated.replyTo || emailConfig.replyTo,
      });

      // Atualiza log como enviado
      await EmailLogRepository.markAsSent(emailLog.id, result.data?.id);

      if (emailConfig.isDevelopment) {
        console.log("[Email] Email React enviado:", {
          to: validated.to,
          subject: validated.subject,
          result,
        });
      }

      return { success: true, data: result };
    } catch (error) {
      // Atualiza log como falha
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar email";
      await EmailLogRepository.markAsFailed(emailLog.id, errorMessage);

      console.error("[Email] Erro ao enviar email React:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envia email de boas-vindas
   */
  static async sendWelcomeEmail(input: WelcomeEmailInput, userId?: string) {
    const validated = welcomeEmailSchema.parse(input);

    return this.sendReactEmail(
      {
        to: validated.to,
        subject: "Bem-vindo ao Finko Money! 🎉",
        react: WelcomeEmailTemplate({
          userName: validated.userName,
        }),
      },
      {
        userId,
        emailType: "welcome",
        metadata: { userName: validated.userName },
      }
    );
  }

  /**
   * Envia email de redefinição de senha
   */
  static async sendPasswordResetEmail(input: PasswordResetEmailInput, userId?: string) {
    const validated = passwordResetEmailSchema.parse(input);

    return this.sendReactEmail(
      {
        to: validated.to,
        subject: "Redefinição de Senha - Finko Money",
        react: PasswordResetEmailTemplate({
          userName: validated.userName,
          resetLink: validated.resetLink,
        }),
      },
      {
        userId,
        emailType: "password_reset",
        metadata: { userName: validated.userName },
      }
    );
  }

  /**
   * Envia email de confirmação de transação
   */
  static async sendTransactionConfirmationEmail(
    input: TransactionConfirmationEmailInput,
    userId?: string
  ) {
    const validated = transactionConfirmationEmailSchema.parse(input);

    const transactionTypeLabel =
      validated.transactionType === "income" ? "Receita" : "Despesa";

    return this.sendReactEmail(
      {
        to: validated.to,
        subject: `${transactionTypeLabel} Registrada - Finko Money`,
        react: TransactionConfirmationEmailTemplate({
          userName: validated.userName,
          transactionType: validated.transactionType,
          amount: validated.amount,
          description: validated.description,
          date: validated.date,
        }),
      },
      {
        userId,
        emailType: "transaction_confirmation",
        metadata: {
          userName: validated.userName,
          transactionType: validated.transactionType,
          amount: validated.amount,
          description: validated.description,
        },
      }
    );
  }

  /**
   * Envia email de lembrete de pagamento
   */
  static async sendPaymentReminderEmail(input: PaymentReminderEmailInput, userId?: string) {
    const validated = paymentReminderEmailSchema.parse(input);

    return this.sendReactEmail(
      {
        to: validated.to,
        subject: "Lembrete de Pagamentos - Finko Money",
        react: PaymentReminderEmailTemplate({
          userName: validated.userName,
          transactions: validated.transactions,
        }),
      },
      {
        userId,
        emailType: "payment_reminder",
        metadata: {
          userName: validated.userName,
          transactionCount: validated.transactions.length,
        },
      }
    );
  }

  /**
   * Envia email com código de autenticação de dois fatores (2FA)
   */
  static async send2FAEmail(input: TwoFactorEmailInput, userId?: string) {
    const validated = twoFactorEmailSchema.parse(input);

    return this.sendReactEmail(
      {
        to: validated.to,
        subject: "Código de Verificação - Finko Money",
        react: TwoFactorEmailTemplate({
          userName: validated.userName,
          code: validated.code,
          expiresInMinutes: validated.expiresInMinutes,
        }),
      },
      {
        userId,
        emailType: "2fa",
        metadata: {
          userName: validated.userName,
          codeLength: validated.code.length,
          expiresInMinutes: validated.expiresInMinutes,
        },
      }
    );
  }

  /**
   * Método auxiliar para retry de envio
   */
  private static async sendWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = emailConfig.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, emailConfig.retryDelay)
        );
        return this.sendWithRetry(fn, retries - 1);
      }
      throw error;
    }
  }
}
