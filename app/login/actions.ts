"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserService } from "@/src/modules/user";
import { UserRepository } from "@/src/modules/user/user.repository";
import { TwoFactorService } from "@/src/modules/two-factor";
import { createClient } from "@/lib/supabase/server";

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

    // Faz login
    const { user } = await UserService.login(input);

    // Busca perfil para verificar se é admin
    const profile = await UserRepository.findById(user.id);

    // Se for admin, requer 2FA
    if (profile?.is_admin) {
      // Faz logout temporário (usuário precisa verificar código)
      const supabase = await createClient();
      await supabase.auth.signOut();

      // Gera e envia código 2FA
      const result = await TwoFactorService.generateAndSendCode(
        { userId: user.id, type: "2fa" },
        input.email,
        profile.full_name || "Admin"
      );

      if (!result.success) {
        return { error: result.error || "Erro ao enviar código de verificação" };
      }

      // Retorna indicando que precisa de 2FA
      return {
        requires2FA: true,
        userId: user.id,
        email: input.email,
      };
    }

    // Se não for admin, login normal
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

/**
 * Verifica código 2FA e completa o login do admin
 */
export async function verify2FACode(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const code = formData.get("code") as string;

    if (!userId || !email || !password || !code) {
      return { error: "Dados inválidos" };
    }

    // Verifica o código 2FA
    const result = await TwoFactorService.verifyCode({
      userId,
      code,
      type: "2fa",
    });

    if (!result.success) {
      return { error: result.error || "Código inválido ou expirado" };
    }

    // Código válido - faz login novamente
    await UserService.login({ email, password });

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // Re-lança erros de redirect do Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Erro ao verificar código" };
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
