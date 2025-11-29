-- Tornar ruan.ritah@gmail.com admin
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'ruan.ritah@gmail.com';

-- Tornar teste@gmail.com usuário comum (caso seja criado)
UPDATE public.users
SET is_admin = FALSE
WHERE email = 'teste@gmail.com';
