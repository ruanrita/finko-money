import { cookies } from "next/headers";
import { createClient } from "./server";
import type { BranchWithMembers } from "@/src/types/database";

const CURRENT_BRANCH_COOKIE = "finko_current_branch";

/**
 * Pega o branch ID atual do cookie
 */
export async function getCurrentBranchId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CURRENT_BRANCH_COOKIE)?.value || null;
}

/**
 * Define o branch atual no cookie
 * IMPORTANTE: Deve ser chamado apenas de dentro de Server Actions ou Route Handlers
 * Para trocar branch, use switchBranch() ou switchBranchAction()
 */
export async function setCurrentBranchId(branchId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_BRANCH_COOKIE, branchId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    path: "/",
  });
}

/**
 * Remove o branch atual do cookie
 * IMPORTANTE: Deve ser chamado apenas de dentro de Server Actions ou Route Handlers
 */
export async function clearCurrentBranchId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CURRENT_BRANCH_COOKIE);
}

/**
 * Pega o branch atual do usuário (do cookie ou primeiro disponível)
 */
export async function getCurrentBranch(userId: string): Promise<BranchWithMembers> {
  const supabase = await createClient();

  // Tentar pegar do cookie primeiro
  const currentBranchId = await getCurrentBranchId();

  if (currentBranchId) {
    // Validar se o usuário tem acesso a este branch
    const { data: branch, error } = await supabase
      .from("branches")
      .select(`
        *,
        branch_members!inner(
          user_id,
          role,
          joined_at
        )
      `)
      .eq("id", currentBranchId)
      .eq("branch_members.user_id", userId)
      .single();

    if (!error && branch) {
      return branch;
    }

    // Se o branch do cookie não existe mais, continua para pegar o primeiro disponível
    // (O cookie será atualizado automaticamente na próxima navegação)
  }

  // Se não encontrou no cookie ou não tem acesso, pegar primeiro branch disponível
  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select(`
      *,
      branch_members!inner(
        user_id,
        role,
        joined_at
      )
    `)
    .eq("branch_members.user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (branchesError) {
    throw new Error("Erro ao buscar branches do usuário");
  }

  // Se não tem nenhum branch, criar um automaticamente
  if (!branches || branches.length === 0) {
    // Usar função RPC que cria branch + membership atomicamente (resolve RLS)
    const { data: newBranch, error: createError } = await supabase
      .rpc("create_branch_with_owner", {
        p_name: "Financas",
        p_description: "Workspace financeiro pessoal",
      })
      .single();

    if (createError || !newBranch) {
      throw new Error("Erro ao criar branch padrão");
    }

    const branchId = (newBranch as any).id;

    // Criar categorias padrão para o novo branch
    await supabase.from("categories").insert([
      { user_id: userId, branch_id: branchId, name: "Alimentacao", color: "#ef4444", icon: "Utensils" },
      { user_id: userId, branch_id: branchId, name: "Transporte", color: "#3b82f6", icon: "Car" },
      { user_id: userId, branch_id: branchId, name: "Moradia", color: "#8b5cf6", icon: "Home" },
      { user_id: userId, branch_id: branchId, name: "Lazer", color: "#ec4899", icon: "Gamepad2" },
      { user_id: userId, branch_id: branchId, name: "Saude", color: "#10b981", icon: "Heart" },
      { user_id: userId, branch_id: branchId, name: "Educacao", color: "#f59e0b", icon: "GraduationCap" },
      { user_id: userId, branch_id: branchId, name: "Assinaturas", color: "#6366f1", icon: "ShoppingCart" },
      { user_id: userId, branch_id: branchId, name: "Outros", color: "#6b7280", icon: "DollarSign" },
    ] as any);

    // Nota: Cookie será setado na primeira request subsequente
    return newBranch as any;
  }

  const firstBranch = branches[0];

  // Nota: Cookie será setado na primeira request subsequente
  return firstBranch;
}

/**
 * Pega todos os branches que o usuário tem acesso
 */
export async function getUserBranches(userId: string): Promise<BranchWithMembers[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select(`
      *,
      branch_members!inner(
        user_id,
        role,
        joined_at
      )
    `)
    .eq("branch_members.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Erro ao buscar branches do usuário");
  }

  return data || [];
}

/**
 * Troca o branch atual
 * IMPORTANTE: Deve ser chamado apenas de dentro de Server Actions
 */
export async function switchBranch(userId: string, branchId: string) {
  const supabase = await createClient();

  // Validar se o usuário tem acesso a este branch
  const { data: branch, error } = await supabase
    .from("branch_members")
    .select("id")
    .eq("branch_id", branchId)
    .eq("user_id", userId)
    .single();

  if (error || !branch) {
    throw new Error("Você não tem acesso a este branch");
  }

  // Salvar no cookie (funciona porque é chamado de Server Action)
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_BRANCH_COOKIE, branchId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    path: "/",
  });
}

/**
 * Pega o role do usuário no branch atual
 */
export async function getUserRoleInBranch(
  userId: string,
  branchId: string
): Promise<"owner" | "member" | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branch_members")
    .select("role")
    .eq("branch_id", branchId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as { role: "owner" | "member" }).role;
}

/**
 * Verifica se o usuário é owner de um branch
 */
export async function isOwner(userId: string, branchId: string): Promise<boolean> {
  const role = await getUserRoleInBranch(userId, branchId);
  return role === "owner";
}
