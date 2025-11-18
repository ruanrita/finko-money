import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { TransactionFilters } from "./transaction.schema";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export class TransactionRepository {
  /**
   * Busca todas as transações de um usuário com filtros
   */
  static async findByUserId(
    userId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    const supabase = await createClient();

    let query = supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("user_id", userId);

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.payment_method) {
      query = query.eq("payment_method", filters.payment_method);
    }

    if (filters?.installment_type) {
      query = query.eq("installment_type", filters.installment_type);
    }

    if (filters?.month) {
      const [year, month] = filters.month.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split("T")[0];
      query = query.gte("due_date", startDate).lte("due_date", endDate);
    }

    if (filters?.search) {
      query = query.ilike("description", `%${filters.search}%`);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    // Filtro de status
    if (filters?.status === "paid") {
      query = query.not("paid_at", "is", null);
    } else if (filters?.status === "pending") {
      query = query
        .is("paid_at", null)
        .gte("due_date", new Date().toISOString().split("T")[0]);
    } else if (filters?.status === "overdue") {
      query = query
        .is("paid_at", null)
        .lt("due_date", new Date().toISOString().split("T")[0]);
    }

    query = query.order("due_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca uma transação por ID
   */
  static async findById(
    id: string,
    userId: string
  ): Promise<Transaction | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Erro ao buscar transação: ${error.message}`);
    }

    return data;
  }

  /**
   * Cria uma nova transação
   */
  static async create(
    userId: string,
    input: Omit<TransactionInsert, "user_id" | "id">
  ): Promise<Transaction> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...input,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    return data;
  }

  /**
   * Cria múltiplas transações (para parcelamento)
   */
  static async createMany(
    userId: string,
    inputs: Omit<TransactionInsert, "user_id" | "id">[]
  ): Promise<Transaction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert(inputs.map((input) => ({ ...input, user_id: userId })))
      .select();

    if (error) {
      throw new Error(`Erro ao criar transações: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Atualiza uma transação
   */
  static async update(
    id: string,
    userId: string,
    input: TransactionUpdate
  ): Promise<Transaction> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta uma transação
   */
  static async delete(id: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }
  }

  /**
   * Deleta transações em lote (para deletar todas as parcelas)
   */
  static async deleteMany(ids: string[], userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId)
      .in("id", ids);

    if (error) {
      throw new Error(`Erro ao deletar transações: ${error.message}`);
    }
  }

  /**
   * Busca transações filhas (parcelas de uma transação pai)
   */
  static async findByParentId(
    parentId: string,
    userId: string
  ): Promise<Transaction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("parent_transaction_id", parentId)
      .eq("user_id", userId)
      .order("current_installment");

    if (error) {
      throw new Error(`Erro ao buscar parcelas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calcula totais por tipo (income/expense) em um período
   */
  static async calculateTotals(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ income: number; expense: number }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .not("paid_at", "is", null)
      .gte("due_date", startDate)
      .lte("due_date", endDate);

    if (error) {
      throw new Error(`Erro ao calcular totais: ${error.message}`);
    }

    const totals = (data || []).reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += Number(transaction.amount);
        } else {
          acc.expense += Number(transaction.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return totals;
  }
}
