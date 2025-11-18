import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export class CategoryRepository {
  /**
   * Busca todas as categorias de um usuário
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
  static async findById(id: string, userId: string): Promise<Category | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
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
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...input,
        user_id: userId,
      })
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
    userId: string,
    input: CategoryUpdate
  ): Promise<Category> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
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
  static async delete(id: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Erro ao deletar categoria: ${error.message}`);
    }
  }

  /**
   * Verifica se uma categoria já existe para o usuário
   */
  static async existsByName(
    name: string,
    userId: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
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
