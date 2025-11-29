-- Script para tornar um usuário em admin
-- Execute este script no Supabase SQL Editor ou via CLI

-- Exemplo 1: Tornar um usuário admin pelo email
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'ruan@gmail.com';

-- Exemplo 2: Tornar um usuário admin pelo ID
-- UPDATE public.users
-- SET is_admin = TRUE
-- WHERE id = 'USER_ID_AQUI';

-- Exemplo 3: Remover privilégios de admin
-- UPDATE public.users
-- SET is_admin = FALSE
-- WHERE email = 'usuario@email.com';

-- Verificar quais usuários são admins
SELECT id, email, full_name, is_admin, created_at
FROM public.users
WHERE is_admin = TRUE
ORDER BY created_at DESC;
