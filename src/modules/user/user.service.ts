import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "./user.repository";
import type {
  LoginInput,
  SignupInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from "./user.schema";
import type { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface AuthResponse {
  user: User;
  profile?: UserProfile;
}

export class UserService {
  /**
   * Login de usuário
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("Usuário não encontrado");
    }

    // Busca perfil do usuário
    const profile = await UserRepository.findById(data.user.id);

    return {
      user: data.user,
      profile: profile || undefined,
    };
  }

  /**
   * Cadastro de usuário
   */
  static async signup(input: SignupInput): Promise<AuthResponse> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
        },
      },
    });

    if (error) {
      throw new Error(`Erro ao criar conta: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("Erro ao criar usuário");
    }

    // O perfil é criado automaticamente via trigger no banco
    // Mas podemos buscar para confirmar
    const profile = await UserRepository.findById(data.user.id);

    return {
      user: data.user,
      profile: profile || undefined,
    };
  }

  /**
   * Logout de usuário
   */
  static async signOut(): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Erro ao sair: ${error.message}`);
    }
  }

  /**
   * Busca usuário autenticado
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }

  /**
   * Busca perfil do usuário autenticado
   */
  static async getProfile(userId: string): Promise<UserProfile> {
    const profile = await UserRepository.findById(userId);

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    return profile;
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    return await UserRepository.updateProfile(userId, input);
  }

  /**
   * Altera senha do usuário
   */
  static async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    const supabase = await createClient();

    // Verifica senha atual fazendo re-autenticação
    const profile = await UserRepository.findById(userId);
    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: input.current_password,
    });

    if (signInError) {
      throw new Error("Senha atual incorreta");
    }

    // Atualiza para nova senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: input.new_password,
    });

    if (updateError) {
      throw new Error(`Erro ao alterar senha: ${updateError.message}`);
    }
  }

  /**
   * Envia e-mail para resetar senha
   */
  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error(`Erro ao enviar e-mail: ${error.message}`);
    }
  }

  /**
   * Deleta conta do usuário
   */
  static async deleteAccount(userId: string): Promise<void> {
    const supabase = await createClient();

    // Deleta perfil e dados relacionados
    await UserRepository.deleteProfile(userId);

    // Deleta autenticação
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      throw new Error(`Erro ao deletar conta: ${error.message}`);
    }
  }
}
