import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { VerificationCode } from "./two-factor.schema";

export class TwoFactorRepository {
  /**
   * Cria um novo código de verificação
   */
  static async create(data: {
    user_id: string;
    code: string;
    type: string;
    expires_at: Date;
  }): Promise<VerificationCode> {
    // Use service client to bypass RLS (system operation during login)
    const supabase = createServiceClient();

    const { data: verificationCode, error } = await supabase
      .from("verification_codes")
      .insert({
        user_id: data.user_id,
        code: data.code,
        type: data.type,
        expires_at: data.expires_at.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar código de verificação: ${error.message}`);
    }

    return verificationCode;
  }

  /**
   * Busca um código de verificação válido
   */
  static async findValidCode(
    userId: string,
    code: string,
    type: string
  ): Promise<VerificationCode | null> {
    // Use service client because user might not be authenticated during 2FA verification
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("type", type)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar código de verificação: ${error.message}`);
    }

    return data;
  }

  /**
   * Marca um código como usado
   */
  static async markAsUsed(codeId: string): Promise<void> {
    // Use service client to bypass RLS (system operation)
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("verification_codes")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", codeId);

    if (error) {
      throw new Error(`Erro ao marcar código como usado: ${error.message}`);
    }
  }

  /**
   * Invalida todos os códigos anteriores de um usuário (para um tipo específico)
   */
  static async invalidatePreviousCodes(
    userId: string,
    type: string
  ): Promise<void> {
    // Use service client to bypass RLS (system operation)
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("verification_codes")
      .update({ is_used: true })
      .eq("user_id", userId)
      .eq("type", type)
      .eq("is_used", false);

    if (error) {
      throw new Error(`Erro ao invalidar códigos anteriores: ${error.message}`);
    }
  }

  /**
   * Verifica se existe algum código válido pendente para um usuário
   */
  static async hasValidPendingCode(
    userId: string,
    type: string
  ): Promise<boolean> {
    // Use service client because user might not be authenticated
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("verification_codes")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao verificar código pendente: ${error.message}`);
    }

    return data !== null;
  }

  /**
   * Limpa códigos expirados (deve ser executado periodicamente)
   */
  static async cleanupExpiredCodes(): Promise<void> {
    // Use service client for cleanup operation
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("verification_codes")
      .delete()
      .lt("expires_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      throw new Error(`Erro ao limpar códigos expirados: ${error.message}`);
    }
  }
}
