"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/src/modules/user";
import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

/**
 * Busca os dados do perfil do usuário autenticado
 */
export async function getUserProfileAction(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const profile = await UserService.getProfile(user.id);
    return profile;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
}
