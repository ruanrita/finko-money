import { createClient } from "@/lib/supabase/server";
import type {
  InstallmentBatch,
  InstallmentBatchInsert,
  InstallmentBatchUpdate,
  InstallmentBatchWithTransactions,
} from "./installment-batch.schema";

export class InstallmentBatchRepository {
  /**
   * Create a new installment batch
   */
  static async create(
    userId: string,
    data: Omit<InstallmentBatchInsert, "user_id" | "id">
  ): Promise<InstallmentBatch> {
    const supabase = await createClient();

    const { data: batch, error } = await supabase
      .from("installment_batches")
      .insert({
        ...data,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar lote de parcelas: ${error.message}`);
    if (!batch) throw new Error("Lote não criado");

    return batch;
  }

  /**
   * Find batch by ID
   */
  static async findById(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("installment_batches")
      .select("*")
      .eq("id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Find batch with all transactions
   */
  static async findByIdWithTransactions(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatchWithTransactions | null> {
    const supabase = await createClient();

    const { data: batch, error: batchError } = await supabase
      .from("installment_batches")
      .select(`
        *,
        categories (
          name,
          color,
          icon
        )
      `)
      .eq("id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    if (batchError || !batch) return null;

    // Fetch associated transactions
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("id, amount, due_date, paid_at, current_installment, description")
      .eq("batch_id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .order("current_installment", { ascending: true });

    if (transError) throw new Error(`Erro ao buscar transações: ${transError.message}`);

    return {
      ...batch,
      transactions: transactions || [],
      category: batch.categories,
    } as InstallmentBatchWithTransactions;
  }

  /**
   * List all batches for a branch
   */
  static async findByBranchId(
    branchId: string,
    userId: string,
    filters?: {
      status?: "active" | "cancelled" | "completed";
      type?: "income" | "expense";
    }
  ): Promise<InstallmentBatch[]> {
    const supabase = await createClient();

    let query = supabase
      .from("installment_batches")
      .select("*")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Erro ao buscar lotes: ${error.message}`);
    return data || [];
  }

  /**
   * Update batch
   */
  static async update(
    id: string,
    branchId: string,
    userId: string,
    data: InstallmentBatchUpdate
  ): Promise<InstallmentBatch> {
    const supabase = await createClient();

    const { data: batch, error } = await supabase
      .from("installment_batches")
      .update(data)
      .eq("id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar lote: ${error.message}`);
    if (!batch) throw new Error("Lote não encontrado");

    return batch;
  }

  /**
   * Delete batch (cascade deletes transactions)
   */
  static async delete(
    id: string,
    branchId: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("installment_batches")
      .delete()
      .eq("id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId);

    if (error) throw new Error(`Erro ao deletar lote: ${error.message}`);
  }

  /**
   * Update paid installments count
   */
  static async updatePaidCount(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch> {
    const supabase = await createClient();

    // Count paid transactions
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", id)
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .not("paid_at", "is", null);

    if (countError) throw new Error(`Erro ao contar parcelas pagas: ${countError.message}`);

    // Update batch
    return await this.update(id, branchId, userId, {
      paid_installments: count || 0,
    });
  }
}
