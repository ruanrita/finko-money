import { Resend } from "resend";

/**
 * Configuração do cliente Resend
 *
 * Para usar em produção, configure a variável de ambiente RESEND_API_KEY
 * com sua chave da API do Resend (https://resend.com)
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Configurações padrão para envio de emails
 */
export const emailConfig = {
  from: process.env.EMAIL_FROM || "noreply@finkomoney.com",
  replyTo: process.env.EMAIL_REPLY_TO || "support@finkomoney.com",

  // Configurações de retry
  maxRetries: 3,
  retryDelay: 1000, // ms

  // Modo de desenvolvimento
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
