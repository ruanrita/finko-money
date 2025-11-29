import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function requireAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
      user: null,
    };
  }

  // Verificar se é admin
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    return {
      error: NextResponse.json({ error: 'Acesso negado: somente administradores' }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}
