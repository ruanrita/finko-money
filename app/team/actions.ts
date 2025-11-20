"use server";

import { revalidatePath } from "next/cache";
import { BranchService } from "@/src/modules/branches";
import { getAuthenticatedUser } from "./auth-helper";

export async function inviteMemberAction(
  branchId: string,
  email: string,
  role: "owner" | "member"
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.addMember(branchId, { email, role }, user.id);
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBranchMembersAction(branchId: string) {
  const user = await getAuthenticatedUser();

  try {
    return await BranchService.getBranchMembers(branchId, user.id);
  } catch (error: any) {
    return null;
  }
}

export async function removeMemberAction(branchId: string, targetUserId: string) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.removeMember(branchId, targetUserId, user.id);
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeMemberRoleAction(
  branchId: string,
  targetUserId: string,
  newRole: "owner" | "member"
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.updateMemberRole(branchId, targetUserId, { role: newRole }, user.id);
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBranchAction(
  branchId: string,
  name: string,
  description: string
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.updateBranch(branchId, { name, description }, user.id);
    revalidatePath("/team");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBranchAction(branchId: string) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.deleteBranch(branchId, user.id);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
