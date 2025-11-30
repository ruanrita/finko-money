import { createServiceClient } from './service';

/**
 * Supabase Admin Client
 * Bypassa RLS para operações do sistema
 */
export const supabaseAdmin = createServiceClient();
