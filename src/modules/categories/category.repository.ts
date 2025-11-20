import { createClient } from "@/lib/supabase/server";
import { BranchAccessControl } from "@/lib/authorization/branch-access";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export class CategoryRepository {
  /**
   * Busca todas as categorias de um branch
   */
  static async findByBranchId(branchId: string, userId: string): Promise<Category[]> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("branch_id", branchId)
      .order("name");

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca todas as categorias de um usuário (mantido para compatibilidade)
   * @deprecated Use findByBranchId instead
   */
  static async findByUserId(userId: string): Promise<Category[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca uma categoria por ID
   */
  static async findById(id: string, branchId: string, userId: string): Promise<Category | null> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .eq("branch_id", branchId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar categoria: ${error.message}`);
    }

    return data;
  }

  /**
   * Cria uma nova categoria
   */
  static async create(
    userId: string,
    input: Omit<CategoryInsert, "user_id" | "id">
  ): Promise<Category> {
    // Verificar se usuário é membro do branch
    if (!input.branch_id || input.branch_id.trim() === "") {
      throw new Error("branch_id é obrigatório");
    }
    await BranchAccessControl.requireMembership(input.branch_id, userId);

    const supabase = await createClient();

    // Preparar dados para inserção, garantindo que campos opcionais sejam null se vazios
    const insertData: any = {
      name: input.name,
      color: input.color,
      branch_id: input.branch_id,
      user_id: userId,
    };

    // Adicionar icon apenas se tiver valor
    if (input.icon && input.icon.trim() !== "") {
      insertData.icon = input.icon;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar categoria: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza uma categoria
   */
  static async update(
    id: string,
    branchId: string,
    userId: string,
    input: CategoryUpdate
  ): Promise<Category> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .eq("branch_id", branchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar categoria: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta uma categoria
   */
  static async delete(id: string, branchId: string, userId: string): Promise<void> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("branch_id", branchId);

    if (error) {
      throw new Error(`Erro ao deletar categoria: ${error.message}`);
    }
  }

  /**
   * Verifica se uma categoria já existe para o branch
   */
  static async existsByName(
    name: string,
    branchId: string,
    userId: string,
    excludeId?: string
  ): Promise<boolean> {
    // Verificar se usuário é membro do branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const supabase = await createClient();

    let query = supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("name", name);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erro ao verificar categoria: ${error.message}`);
    }

    return (count || 0) > 0;
  }
}
