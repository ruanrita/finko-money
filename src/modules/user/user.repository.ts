import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type UserProfileUpdate = Database["public"]["Tables"]["users"]["Update"];

export class UserRepository {
  /**
   * Busca perfil do usuário por ID
   */
  static async findById(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateProfile(
    userId: string,
    input: UserProfileUpdate
  ): Promise<UserProfile> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .update(input)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Cria perfil inicial do usuário (geralmente via trigger no DB)
   */
  static async createProfile(
    userId: string,
    email: string,
    fullName: string
  ): Promise<UserProfile> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        full_name: fullName,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta perfil do usuário
   */
  static async deleteProfile(userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      throw new Error(`Erro ao deletar perfil: ${error.message}`);
    }
  }
}
