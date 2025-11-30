import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { EmailLog } from "./email-log.schema";

export class EmailLogRepository {
  /**
   * Cria um log de email
   */
  static async create(data: {
    user_id?: string | null;
    email_to: string;
    email_type: string;
    subject: string;
    status?: "pending" | "sent" | "failed";
    metadata?: Record<string, any> | null;
  }): Promise<EmailLog> {
    // Use service client to bypass RLS (system operation)
    const supabase = createServiceClient();

    const { data: emailLog, error } = await supabase
      .from("email_logs")
      .insert({
        user_id: data.user_id || null,
        email_to: data.email_to,
        email_type: data.email_type,
        subject: data.subject,
        status: data.status || "pending",
        metadata: data.metadata || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar log de email: ${error.message}`);
    }

    return emailLog as EmailLog;
  }

  /**
   * Atualiza status do email para "sent"
   */
  static async markAsSent(id: string, resendId?: string): Promise<void> {
    // Use service client to bypass RLS (system operation)
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("email_logs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_id: resendId || null,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Erro ao atualizar status do email: ${error.message}`);
    }
  }

  /**
   * Atualiza status do email para "failed"
   */
  static async markAsFailed(id: string, errorMessage: string): Promise<void> {
    // Use service client to bypass RLS (system operation)
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("email_logs")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Erro ao atualizar status do email: ${error.message}`);
    }
  }

  /**
   * Lista logs de emails com filtros
   */
  static async list(filters?: {
    user_id?: string;
    email_type?: string;
    status?: "pending" | "sent" | "failed";
    limit?: number;
    offset?: number;
  }): Promise<EmailLog[]> {
    const supabase = await createClient();

    let query = supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters?.email_type) {
      query = query.eq("email_type", filters.email_type);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar logs de emails: ${error.message}`);
    }

    return (data || []) as EmailLog[];
  }

  /**
   * Conta total de emails por tipo
   */
  static async countByType(): Promise<Record<string, number>> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("email_logs")
      .select("email_type, status");

    if (error) {
      throw new Error(`Erro ao contar emails: ${error.message}`);
    }

    const counts: Record<string, number> = {};

    data?.forEach((log: any) => {
      const key = `${log.email_type}_${log.status}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }

  /**
   * Estatísticas gerais de emails
   */
  static async getStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("email_logs")
      .select("status");

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      sent: data?.filter((log: any) => log.status === "sent").length || 0,
      failed: data?.filter((log: any) => log.status === "failed").length || 0,
      pending: data?.filter((log: any) => log.status === "pending").length || 0,
    };

    return stats;
  }
}
