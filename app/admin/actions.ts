"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/src/modules/user/user.helpers";
import { EmailLogRepository } from "@/src/modules/email-logs";

export async function getAdminMetrics() {
  await requireAdmin();

  const supabase = await createClient();

  // Get total users count
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get total admins count
  const { count: totalAdmins } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", true);

  // Get total transactions count
  const { count: totalTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  // Get email stats
  const emailStats = await EmailLogRepository.getStats();

  // Get recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  // Get recent transactions (last 30 days)
  const { count: recentTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  return {
    users: {
      total: totalUsers || 0,
      admins: totalAdmins || 0,
      recent: recentUsers || 0,
    },
    transactions: {
      total: totalTransactions || 0,
      recent: recentTransactions || 0,
    },
    emails: {
      total: emailStats.total,
      sent: emailStats.sent,
      failed: emailStats.failed,
      pending: emailStats.pending,
    },
  };
}

export async function getAllUsers(filters?: {
  isAdmin?: boolean;
  limit?: number;
  offset?: number;
}) {
  await requireAdmin();

  const supabase = await createClient();

  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.isAdmin !== undefined) {
    query = query.eq("is_admin", filters.isAdmin);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 10) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }

  return data || [];
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  await requireAdmin();

  const supabase = await createClient();

  // Get current user to prevent self-demotion
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (currentUser?.id === userId && !isAdmin) {
    throw new Error("Você não pode remover seu próprio acesso de admin");
  }

  const { error } = await supabase
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    throw new Error(`Erro ao atualizar usuário: ${error.message}`);
  }

  return { success: true };
}

export async function getEmailLogs(filters?: {
  status?: "pending" | "sent" | "failed";
  email_type?: string;
  limit?: number;
  offset?: number;
}) {
  await requireAdmin();

  return EmailLogRepository.list(filters);
}
