import { TwoFactorRepository } from "./two-factor.repository";
import { EmailService } from "../emails";
import type { GenerateCodeInput, VerifyCodeInput } from "./two-factor.schema";
import { generateCodeSchema, verifyCodeSchema } from "./two-factor.schema";

export class TwoFactorService {
  /**
   * Gera um código de 6 dígitos aleatório
   */
  private static generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Gera e envia um código de verificação por email
   */
  static async generateAndSendCode(
    input: GenerateCodeInput,
    userEmail: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const validated = generateCodeSchema.parse(input);

      // Invalida todos os códigos anteriores do usuário para este tipo
      await TwoFactorRepository.invalidatePreviousCodes(
        validated.userId,
        validated.type
      );

      // Gera novo código
      const code = this.generateRandomCode();

      // Define expiração (10 minutos)
      const expiresInMinutes = 10;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      // Salva no banco de dados
      await TwoFactorRepository.create({
        user_id: validated.userId,
        code,
        type: validated.type,
        expires_at: expiresAt,
      });

      // Envia email com o código
      const emailResult = await EmailService.send2FAEmail({
        to: userEmail,
        userName,
        code,
        expiresInMinutes,
      });

      if (!emailResult.success) {
        return {
          success: false,
          error: `Erro ao enviar email: ${emailResult.error}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[2FA] Erro ao gerar e enviar código:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao gerar código",
      };
    }
  }

  /**
   * Verifica se um código é válido
   */
  static async verifyCode(
    input: VerifyCodeInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const validated = verifyCodeSchema.parse(input);

      // Busca código válido
      const verificationCode = await TwoFactorRepository.findValidCode(
        validated.userId,
        validated.code,
        validated.type
      );

      if (!verificationCode) {
        return {
          success: false,
          error: "Código inválido ou expirado",
        };
      }

      // Marca código como usado
      await TwoFactorRepository.markAsUsed(verificationCode.id);

      return { success: true };
    } catch (error) {
      console.error("[2FA] Erro ao verificar código:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao verificar código",
      };
    }
  }

  /**
   * Verifica se um usuário tem um código válido pendente
   */
  static async hasValidPendingCode(
    userId: string,
    type: string = "2fa"
  ): Promise<boolean> {
    try {
      return await TwoFactorRepository.hasValidPendingCode(userId, type);
    } catch (error) {
      console.error("[2FA] Erro ao verificar código pendente:", error);
      return false;
    }
  }
}
