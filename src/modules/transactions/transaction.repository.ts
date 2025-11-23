import { createClient } from "@/lib/supabase/server";
import { BranchAccessControl } from "@/lib/authorization/branch-access";
import type { Database } from "@/types/database";
import type { TransactionFilters, Transaction, TransactionWithCategory, TransactionInsert, TransactionUpdate } from "./transaction.schema";

export class TransactionRepository {
  /**
   * Busca todas as transações de um branch com filtros
   */
  static async findByBranchId(
    branchId: string,
    userId: string,
    filters?: TransactionFilters
  ): Promise<TransactionWithCategory[]> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    let query = supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("branch_id", branchId);

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

    if (filters?.start_date) {
      query = query.gte("due_date", filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte("due_date", filters.end_date);
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
   * Busca todas as transações de um usuário com filtros (mantido para compatibilidade)
   * @deprecated Use findByBranchId instead
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

    if (filters?.start_date) {
      query = query.gte("due_date", filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte("due_date", filters.end_date);
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
    branchId: string,
    userId: string
  ): Promise<Transaction | null> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("id", id)
      .eq("branch_id", branchId)
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
    // Verificar se usuário é membro do branch
    if (!input.branch_id) {
      throw new Error("branch_id é obrigatório");
    }
    await BranchAccessControl.requireMembership(input.branch_id, userId);

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
    // Verificar se usuário é membro do branch (verificar o primeiro input)
    if (!inputs[0]?.branch_id) {
      throw new Error("branch_id é obrigatório");
    }
    await BranchAccessControl.requireMembership(inputs[0].branch_id, userId);

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
    branchId: string,
    userId: string,
    input: TransactionUpdate
  ): Promise<Transaction> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .update(input)
      .eq("id", id)
      .eq("branch_id", branchId)
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
  static async delete(id: string, branchId: string, userId: string): Promise<void> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("branch_id", branchId);

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }
  }

  /**
   * Deleta transações em lote (para deletar todas as parcelas)
   */
  static async deleteMany(ids: string[], branchId: string, userId: string): Promise<void> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("branch_id", branchId)
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
    branchId: string,
    userId: string
  ): Promise<Transaction[]> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("parent_transaction_id", parentId)
      .eq("branch_id", branchId)
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
    branchId: string,
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ income: number; expense: number }> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error} = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("branch_id", branchId)
      .gte("due_date", startDate)
      .lte("due_date", endDate);

    if (error) {
      throw new Error(`Erro ao calcular totais: ${error.message}`);
    }

    const totals = (data || []).reduce(
      (acc: { income: number; expense: number }, transaction: { type: string; amount: number }) => {
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
