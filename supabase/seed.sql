-- =========================================
-- SEED DATA PARA FINKO MONEY
-- =========================================
-- Este seed cria automaticamente:
-- 1. Usuário de teste em auth.users
-- 2. Categorias personalizadas
-- 3. 1 receita + 6 despesas variadas
-- =========================================

DO $$
DECLARE
  v_user_id uuid;
  v_category_salario uuid;
  v_category_moradia uuid;
  v_category_alimentacao uuid;
  v_category_transporte uuid;
  v_category_lazer uuid;
  v_category_saude uuid;
  v_category_educacao uuid;
BEGIN

  -- =========================================
  -- CRIAR USUÁRIO DE TESTE
  -- =========================================
  -- Email: teste@finko.com
  -- Senha: teste123

  -- Verificar se usuário já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'teste@finko.com';

  IF v_user_id IS NULL THEN
    -- Criar usuário em auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'ruan@gmail.com',
      crypt('123456', gen_salt('bf')), -- Senha: 123456
      NOW(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Usuário Teste"}',
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      NULL
    ) RETURNING id INTO v_user_id;

    RAISE NOTICE '✅ Usuário criado: teste@finko.com (senha: teste123)';
    RAISE NOTICE '📝 User ID: %', v_user_id;
  ELSE
    RAISE NOTICE '⚠️  Usuário teste@finko.com já existe (ID: %)', v_user_id;
  END IF;

  -- Esperar trigger criar em public.users
  PERFORM pg_sleep(0.1);

  -- Verificar se public.users foi criado, senão criar manualmente
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES (v_user_id, 'teste@finko.com', 'Usuário Teste');
    RAISE NOTICE '✅ Registro criado em public.users';
  END IF;

  -- =========================================
  -- CATEGORIAS
  -- =========================================
  -- Buscar ou criar categorias
  SELECT id INTO v_category_salario FROM public.categories WHERE user_id = v_user_id AND name = 'Salário' LIMIT 1;
  IF v_category_salario IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Salário', '#10b981')
    RETURNING id INTO v_category_salario;
  END IF;

  SELECT id INTO v_category_moradia FROM public.categories WHERE user_id = v_user_id AND name = 'Moradia' LIMIT 1;
  IF v_category_moradia IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Moradia', '#ef4444')
    RETURNING id INTO v_category_moradia;
  END IF;

  SELECT id INTO v_category_alimentacao FROM public.categories WHERE user_id = v_user_id AND name = 'Alimentação' LIMIT 1;
  IF v_category_alimentacao IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Alimentação', '#f59e0b')
    RETURNING id INTO v_category_alimentacao;
  END IF;

  SELECT id INTO v_category_transporte FROM public.categories WHERE user_id = v_user_id AND name = 'Transporte' LIMIT 1;
  IF v_category_transporte IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Transporte', '#3b82f6')
    RETURNING id INTO v_category_transporte;
  END IF;

  SELECT id INTO v_category_lazer FROM public.categories WHERE user_id = v_user_id AND name = 'Lazer' LIMIT 1;
  IF v_category_lazer IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Lazer', '#8b5cf6')
    RETURNING id INTO v_category_lazer;
  END IF;

  SELECT id INTO v_category_saude FROM public.categories WHERE user_id = v_user_id AND name = 'Saúde' LIMIT 1;
  IF v_category_saude IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Saúde', '#ec4899')
    RETURNING id INTO v_category_saude;
  END IF;

  SELECT id INTO v_category_educacao FROM public.categories WHERE user_id = v_user_id AND name = 'Educação' LIMIT 1;
  IF v_category_educacao IS NULL THEN
    INSERT INTO public.categories (user_id, name, color)
    VALUES (v_user_id, 'Educação', '#06b6d4')
    RETURNING id INTO v_category_educacao;
  END IF;

  -- =========================================
  -- TRANSAÇÕES
  -- =========================================

  -- 1️⃣ RECEITA: Salário (pago mensalmente)
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    paid_at,
    payment_method,
    category_id,
    installment_type,
    is_recurring,
    recurrence_type
  ) VALUES (
    v_user_id,
    'income',
    5500.00,
    'Salário',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days', -- Dia 5 do mês atual
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days', -- Já pago
    'pix',
    v_category_salario,
    'a_vista',
    true, -- ✅ Recorrente mensal
    'monthly'
  );

  -- 2️⃣ DESPESA RECORRENTE: Aluguel
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    payment_method,
    category_id,
    installment_type,
    is_recurring,
    recurrence_type
  ) VALUES (
    v_user_id,
    'expense',
    1800.00,
    'Aluguel',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days', -- Dia 10 do mês
    'pix',
    v_category_moradia,
    'a_vista',
    true, -- ✅ Recorrente mensal
    'monthly'
  );

  -- 3️⃣ DESPESA RECORRENTE: Netflix
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    payment_method,
    category_id,
    installment_type,
    is_recurring,
    recurrence_type
  ) VALUES (
    v_user_id,
    'expense',
    49.90,
    'Netflix',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days', -- Dia 15
    'credito',
    v_category_lazer,
    'a_vista',
    true, -- ✅ Recorrente mensal
    'monthly'
  );

  -- 4️⃣ DESPESA PARCELADA: Notebook (12x)
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    payment_method,
    category_id,
    installment_type,
    installments_count,
    current_installment,
    is_recurring
  ) VALUES (
    v_user_id,
    'expense',
    291.67, -- 3500 / 12 = 291,67 por parcela
    'Notebook (1/12)',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '20 days',
    'credito',
    v_category_educacao,
    'parcelado',
    12,
    1,
    false
  );

  -- 5️⃣ DESPESA À VISTA: Mercado
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    paid_at,
    payment_method,
    category_id,
    installment_type,
    is_recurring
  ) VALUES (
    v_user_id,
    'expense',
    450.00,
    'Mercado',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days', -- Já pago
    'debito',
    v_category_alimentacao,
    'a_vista',
    false
  );

  -- 6️⃣ DESPESA À VISTA: Uber
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    paid_at,
    payment_method,
    category_id,
    installment_type,
    is_recurring
  ) VALUES (
    v_user_id,
    'expense',
    85.50,
    'Corridas Uber',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days', -- Já pago
    'credito',
    v_category_transporte,
    'a_vista',
    false
  );

  -- 7️⃣ DESPESA PENDENTE: Plano de Saúde
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    due_date,
    payment_method,
    category_id,
    installment_type,
    is_recurring
  ) VALUES (
    v_user_id,
    'expense',
    380.00,
    'Plano de Saúde',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '25 days', -- Pendente
    'boleto',
    v_category_saude,
    'a_vista',
    false
  );

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEEDS CRIADOS COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '👤 USUÁRIO DE TESTE:';
  RAISE NOTICE '   Email: teste@finko.com';
  RAISE NOTICE '   Senha: teste123';
  RAISE NOTICE '   ID: %', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '📊 TRANSAÇÕES CRIADAS:';
  RAISE NOTICE '   💰 1 receita (Salário)';
  RAISE NOTICE '   💸 6 despesas variadas';
  RAISE NOTICE '   🔄 3 recorrentes (Salário, Aluguel, Netflix)';
  RAISE NOTICE '   💳 1 parcelada (Notebook 1/12)';
  RAISE NOTICE '   ✅ 3 pagas';
  RAISE NOTICE '   ⏳ 4 pendentes';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Acesse: http://localhost:3000/login';
  RAISE NOTICE '';

END $$;
