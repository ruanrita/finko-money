import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "./user.service";
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from "./user.schema";

/**
 * POST /api/auth/login - Login de usuário
 */
export async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const result = await UserService.login(input);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 401 }
    );
  }
}

/**
 * POST /api/auth/signup - Cadastro de usuário
 */
export async function signupHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const input = signupSchema.parse(body);

    const result = await UserService.signup(input);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * POST /api/auth/logout - Logout de usuário
 */
export async function logoutHandler(request: NextRequest) {
  try {
    await UserService.signOut();

    return NextResponse.json({ message: "Logout realizado" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile - Busca perfil do usuário autenticado
 */
export async function getProfileHandler(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const profile = await UserService.getProfile(user.id);

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile - Atualiza perfil do usuário
 */
export async function updateProfileHandler(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const input = updateProfileSchema.parse(body);

    const profile = await UserService.updateProfile(user.id, input);

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * POST /api/user/change-password - Altera senha do usuário
 */
export async function changePasswordHandler(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const input = changePasswordSchema.parse(body);

    await UserService.changePassword(user.id, input);

    return NextResponse.json(
      { message: "Senha alterada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * POST /api/auth/reset-password - Envia e-mail para resetar senha
 */
export async function resetPasswordHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);

    await UserService.resetPassword(input);

    return NextResponse.json(
      { message: "E-mail enviado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/user - Deleta conta do usuário
 */
export async function deleteAccountHandler(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await UserService.deleteAccount(user.id);

    return NextResponse.json(
      { message: "Conta deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
