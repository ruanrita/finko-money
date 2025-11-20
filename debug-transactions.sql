-- Script de debug para verificar transações e branches

-- 1. Verificar usuários
SELECT 'USUÁRIOS:' as info;
SELECT id, email FROM auth.users;

-- 2. Verificar branches
SELECT 'BRANCHES:' as info;
SELECT * FROM public.branches;

-- 3. Verificar branch_members
SELECT 'BRANCH MEMBERS:' as info;
SELECT bm.*, u.email
FROM public.branch_members bm
LEFT JOIN auth.users u ON u.id = bm.user_id;

-- 4. Verificar transações (SEM RLS - precisa rodar como admin)
SELECT 'TRANSAÇÕES (raw):' as info;
SELECT id, user_id, branch_id, type, amount, description, due_date
FROM public.transactions
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar se transações têm branch_id
SELECT 'TRANSAÇÕES COM BRANCH_ID NULL:' as info;
SELECT COUNT(*) as count FROM public.transactions WHERE branch_id IS NULL;

-- 6. Verificar se existe relacionamento entre user, branch e transactions
SELECT 'VERIFICAÇÃO DE RELACIONAMENTO:' as info;
SELECT
  t.id as transaction_id,
  t.description,
  t.user_id,
  t.branch_id,
  bm.user_id as member_user_id,
  CASE
    WHEN bm.user_id IS NOT NULL THEN 'OK - User é membro do branch'
    ELSE 'PROBLEMA - User NÃO é membro do branch'
  END as status
FROM public.transactions t
LEFT JOIN public.branch_members bm
  ON bm.branch_id = t.branch_id AND bm.user_id = t.user_id;
