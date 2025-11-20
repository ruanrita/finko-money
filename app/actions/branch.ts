"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { switchBranch, getUserBranches, getCurrentBranch } from "@/lib/supabase/branch-context";

export async function switchBranchAction(branchId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await switchBranch(user.id, branchId);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserBranchesAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const branches = await getUserBranches(user.id);
    return { success: true, branches };
  } catch (error: any) {
    return { success: false, error: error.message, branches: [] };
  }
}

export async function getCurrentBranchAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const branch = await getCurrentBranch(user.id);
    return { success: true, branch };
  } catch (error: any) {
    return { success: false, error: error.message, branch: null };
  }
}
