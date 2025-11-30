import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service client - Bypasses RLS
 * Use APENAS para operações de sistema que precisam acontecer sem autenticação:
 * - Criar logs de email
 * - Criar códigos de verificação
 * - Operações administrativas automáticas
 *
 * NUNCA use para operações de usuário normal!
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
