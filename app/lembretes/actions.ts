"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReminderService } from "@/src/modules/reminders";
import type { CreateReminderInput, UpdateReminderInput } from "@/src/modules/reminders";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getRemindersAction() {
  const user = await getAuthenticatedUser();

  try {
    return await ReminderService.getUserReminders(user.id);
  } catch (error: any) {
    console.error("getRemindersAction error:", error.message);
    return [];
  }
}

export async function getPendingRemindersAction() {
  const user = await getAuthenticatedUser();

  try {
    return await ReminderService.getPendingReminders(user.id);
  } catch (error: any) {
    console.error("getPendingRemindersAction error:", error.message);
    return [];
  }
}

export async function createReminderAction(input: CreateReminderInput) {
  const user = await getAuthenticatedUser();

  try {
    await ReminderService.createReminder(input, user.id);
    revalidatePath("/lembretes");
    revalidatePath("/financeiro");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReminderAction(reminderId: string, input: UpdateReminderInput) {
  const user = await getAuthenticatedUser();

  try {
    await ReminderService.updateReminder(reminderId, input, user.id);
    revalidatePath("/lembretes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReminderAction(reminderId: string) {
  const user = await getAuthenticatedUser();

  try {
    await ReminderService.deleteReminder(reminderId, user.id);
    revalidatePath("/lembretes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markReminderAsSentAction(reminderId: string) {
  const user = await getAuthenticatedUser();

  try {
    await ReminderService.markReminderAsSent(reminderId, user.id);
    revalidatePath("/lembretes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
