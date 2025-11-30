/**
 * Mapeia erros do Supabase para mensagens amigáveis em português
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  "Invalid login credentials": "Email ou senha incorretos",
  "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada",
  "User already registered": "Este email já está cadastrado",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
  "Unable to validate email address: invalid format": "Email inválido",
  "Signup requires a valid password": "Senha é obrigatória",
  "User not found": "Usuário não encontrado",
  "Invalid email or password": "Email ou senha incorretos",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos",

  // Database errors
  "duplicate key value violates unique constraint": "Este registro já existe",
  "new row violates row-level security policy": "Você não tem permissão para realizar esta ação",
  "permission denied": "Permissão negada",

  // Network errors
  "Failed to fetch": "Erro de conexão. Verifique sua internet",
  "NetworkError": "Erro de rede. Tente novamente",

  // Custom errors
  "Código inválido ou expirado": "Código inválido ou expirado",
  "Código de verificação inválido": "Código de verificação inválido",
  "Você não pode remover seu próprio acesso de admin": "Você não pode remover seu próprio acesso de admin",
};

/**
 * Traduz mensagens de erro do backend para português amigável
 */
export function translateError(error: unknown): string {
  if (!error) {
    return "Ocorreu um erro inesperado";
  }

  // Se é uma string, procura tradução
  if (typeof error === "string") {
    // Procura por correspondência exata
    if (ERROR_MESSAGES[error]) {
      return ERROR_MESSAGES[error];
    }

    // Procura por substring
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (error.includes(key)) {
        return value;
      }
    }

    // Retorna a mensagem original se não encontrar tradução
    return error;
  }

  // Se é um Error object
  if (error instanceof Error) {
    return translateError(error.message);
  }

  // Se é um objeto com propriedade message
  if (typeof error === "object" && error !== null && "message" in error) {
    return translateError((error as { message: string }).message);
  }

  return "Ocorreu um erro inesperado";
}

/**
 * Remove prefixos comuns de erro para mensagens mais limpas
 */
export function cleanErrorMessage(message: string): string {
  const prefixes = [
    "Erro ao fazer login: ",
    "Erro ao criar conta: ",
    "Erro ao enviar e-mail: ",
    "Erro ao atualizar: ",
    "Erro ao deletar: ",
    "Erro ao buscar: ",
    "Erro ao criar: ",
    "Error: ",
  ];

  let cleaned = message;
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
    }
  }

  return translateError(cleaned);
}

/**
 * Formata erro para exibição ao usuário
 */
export function formatError(error: unknown): string {
  const translated = translateError(error);
  return cleanErrorMessage(translated);
}
