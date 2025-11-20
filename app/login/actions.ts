"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserService } from "@/src/modules/user";

// Função helper para detectar erros de redirect do Next.js
function isRedirectError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = (error as { digest?: string }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}

export async function login(formData: FormData) {
  try {
    const input = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    await UserService.login(input);

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // Re-lança erros de redirect do Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Erro ao fazer login" };
  }
}

export async function signup(formData: FormData) {
  try {
    const input = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      full_name: formData.get("full_name") as string,
    };

    await UserService.signup(input);

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // Re-lança erros de redirect do Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Erro ao criar conta" };
  }
}

export async function signOut() {
  try {
    await UserService.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    // Re-lança erros de redirect do Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Erro ao sair" };
  }
}
