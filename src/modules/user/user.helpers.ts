import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "./user.repository";

/**
 * Verifica se o usuário autenticado atual é admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const profile = await UserRepository.findById(user.id);
  return profile?.is_admin === true;
}

/**
 * Verifica se um usuário específico é admin pelo ID
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await UserRepository.findById(userId);
  return profile?.is_admin === true;
}

/**
 * Garante que o usuário autenticado atual é admin, caso contrário lança erro
 * Útil para proteger server actions
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    throw new Error("Acesso negado: apenas administradores podem acessar este recurso");
  }
}

/**
 * Retorna o ID do usuário autenticado atual
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id || null;
}

/**
 * Retorna o perfil completo do usuário autenticado atual
 */
export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  return UserRepository.findById(userId);
}
