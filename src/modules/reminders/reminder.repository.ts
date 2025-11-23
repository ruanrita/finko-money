import { createClient } from "@/lib/supabase/server";
import type { CreateReminderInput, UpdateReminderInput } from "./reminder.schema";

export class ReminderRepository {
  // Buscar todos os lembretes do usuário
  static async findByUserId(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        transactions (
          id,
          description,
          amount,
          due_date,
          type
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Buscar lembretes de uma transação específica
  static async findByTransactionId(transactionId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Buscar lembrete por ID
  static async findById(reminderId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        transactions (
          id,
          description,
          amount,
          due_date,
          type
        )
      `)
      .eq("id", reminderId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Lembrete não encontrado");
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Criar lembrete
  static async create(input: CreateReminderInput, userId: string) {
    const supabase = await createClient();

    // Verificar se a transação pertence ao usuário
    const { data: transaction } = await supabase
      .from("transactions")
      .select("user_id, branch_id")
      .eq("id", input.transaction_id)
      .single();

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    if (!transaction.branch_id) {
      throw new Error("Transação sem branch associada");
    }

    // Verificar se o usuário tem acesso à branch da transação
    const { data: membership } = await supabase
      .from("branch_members")
      .select("id")
      .eq("branch_id", transaction.branch_id)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      throw new Error("Você não tem acesso a esta transação");
    }

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,
        transaction_id: input.transaction_id,
        days_before: input.days_before,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe um lembrete para esta transação");
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Atualizar lembrete
  static async update(reminderId: string, input: UpdateReminderInput, userId: string) {
    const supabase = await createClient();

    // Verificar se o lembrete pertence ao usuário
    const { data: reminder } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", reminderId)
      .single();

    if (!reminder) {
      throw new Error("Lembrete não encontrado");
    }

    if (reminder.user_id !== userId) {
      throw new Error("Você não tem permissão para atualizar este lembrete");
    }

    const { data, error } = await supabase
      .from("reminders")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Deletar lembrete
  static async delete(reminderId: string, userId: string) {
    const supabase = await createClient();

    // Verificar se o lembrete pertence ao usuário
    const { data: reminder } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", reminderId)
      .single();

    if (!reminder) {
      throw new Error("Lembrete não encontrado");
    }

    if (reminder.user_id !== userId) {
      throw new Error("Você não tem permissão para deletar este lembrete");
    }

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", reminderId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  // Buscar lembretes pendentes (não enviados) que devem ser enviados
  static async findPendingReminders(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        transactions (
          id,
          description,
          amount,
          due_date,
          type,
          paid_at
        )
      `)
      .eq("user_id", userId)
      .is("sent_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Filtrar apenas lembretes que devem ser enviados (transações não pagas e dentro do prazo)
    const now = new Date();
    return data?.filter((reminder: any) => {
      if (!reminder.transactions || reminder.transactions.paid_at) {
        return false;
      }

      const dueDate = new Date(reminder.transactions.due_date);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - reminder.days_before);

      return now >= reminderDate && now <= dueDate;
    });
  }

  // Marcar lembrete como enviado
  static async markAsSent(reminderId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reminders")
      .update({
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
