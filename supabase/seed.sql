-- =========================================
-- SEED DATA PARA FINKO MONEY
-- =========================================
-- Este seed cria automaticamente:
-- 1. Usuário de teste em auth.users
-- 2. Branch (workspace) padrão
-- 3. Categorias personalizadas
-- 4. 1 receita + 6 despesas variadas
-- =========================================

DO $$
DECLARE
  v_user_id uuid;
  v_branch_id uuid;
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
  -- Email: ruan@gmail.com
  -- Senha: 123456

  -- Verificar se usuário já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'ruan@gmail.com';

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
      '{"full_name":"Ruan Rita"}',
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

    RAISE NOTICE '✅ Usuário criado: ruan@gmail.com (senha: 123456)';
    RAISE NOTICE '📝 User ID: %', v_user_id;
  ELSE
    RAISE NOTICE '⚠️  Usuário ruan@gmail.com já existe (ID: %)', v_user_id;
  END IF;

  -- Esperar trigger criar em public.users
  PERFORM pg_sleep(0.1);

  -- Verificar se public.users foi criado, senão criar manualmente
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES (v_user_id, 'ruan@gmail.com', 'Ruan Rita');
    RAISE NOTICE '✅ Registro criado em public.users';
  END IF;

  -- =========================================
  -- LIMPAR DADOS ANTIGOS (se existirem)
  -- =========================================
  -- Deletar transações antigas
  DELETE FROM public.transactions WHERE user_id = v_user_id;

  -- Deletar categorias antigas
  DELETE FROM public.categories WHERE user_id = v_user_id;

  -- Deletar memberships antigos
  DELETE FROM public.branch_members WHERE user_id = v_user_id;

  -- Deletar branches antigos (se não tiver outros membros)
  DELETE FROM public.branches WHERE id IN (
    SELECT b.id FROM public.branches b
    LEFT JOIN public.branch_members bm ON bm.branch_id = b.id
    WHERE bm.id IS NULL
  );

  RAISE NOTICE '🧹 Dados antigos limpos';

  -- =========================================
  -- CRIAR BRANCH (WORKSPACE)
  -- =========================================
  -- Criar branch novo
  INSERT INTO public.branches (name, description)
  VALUES ('Minhas Financas', 'Workspace financeiro pessoal')
  RETURNING id INTO v_branch_id;

  -- Adicionar usuário como owner
  INSERT INTO public.branch_members (branch_id, user_id, role)
  VALUES (v_branch_id, v_user_id, 'owner');

  RAISE NOTICE '✅ Branch criado: Minhas Financas';
  RAISE NOTICE '📝 Branch ID: %', v_branch_id;

  -- =========================================
  -- CATEGORIAS
  -- =========================================
  -- Buscar ou criar categorias
  SELECT id INTO v_category_salario FROM public.categories WHERE branch_id = v_branch_id AND name = 'Salario' LIMIT 1;
  IF v_category_salario IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Salario', '#10b981', 'DollarSign')
    RETURNING id INTO v_category_salario;
  END IF;

  SELECT id INTO v_category_moradia FROM public.categories WHERE branch_id = v_branch_id AND name = 'Moradia' LIMIT 1;
  IF v_category_moradia IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Moradia', '#ef4444', 'Home')
    RETURNING id INTO v_category_moradia;
  END IF;

  SELECT id INTO v_category_alimentacao FROM public.categories WHERE branch_id = v_branch_id AND name = 'Alimentacao' LIMIT 1;
  IF v_category_alimentacao IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Alimentacao', '#f59e0b', 'Utensils')
    RETURNING id INTO v_category_alimentacao;
  END IF;

  SELECT id INTO v_category_transporte FROM public.categories WHERE branch_id = v_branch_id AND name = 'Transporte' LIMIT 1;
  IF v_category_transporte IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Transporte', '#3b82f6', 'Car')
    RETURNING id INTO v_category_transporte;
  END IF;

  SELECT id INTO v_category_lazer FROM public.categories WHERE branch_id = v_branch_id AND name = 'Lazer' LIMIT 1;
  IF v_category_lazer IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Lazer', '#8b5cf6', 'Gamepad2')
    RETURNING id INTO v_category_lazer;
  END IF;

  SELECT id INTO v_category_saude FROM public.categories WHERE branch_id = v_branch_id AND name = 'Saude' LIMIT 1;
  IF v_category_saude IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Saude', '#ec4899', 'Heart')
    RETURNING id INTO v_category_saude;
  END IF;

  SELECT id INTO v_category_educacao FROM public.categories WHERE branch_id = v_branch_id AND name = 'Educacao' LIMIT 1;
  IF v_category_educacao IS NULL THEN
    INSERT INTO public.categories (user_id, branch_id, name, color, icon)
    VALUES (v_user_id, v_branch_id, 'Educacao', '#06b6d4', 'GraduationCap')
    RETURNING id INTO v_category_educacao;
  END IF;

  -- =========================================
  -- TRANSAÇÕES
  -- =========================================

  -- 1️⃣ RECEITA: Salário (pago mensalmente)
  INSERT INTO public.transactions (
    user_id,
    branch_id,
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
    v_branch_id,
    'income',
    5500.00,
    'Salario',
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
    branch_id,
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
    v_branch_id,
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
    branch_id,
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
    v_branch_id,
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
    branch_id,
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
    v_branch_id,
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
    branch_id,
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
    v_branch_id,
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
    branch_id,
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
    v_branch_id,
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
    branch_id,
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
    v_branch_id,
    'expense',
    380.00,
    'Plano de Saude',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '25 days', -- Pendente
    'boleto',
    v_category_saude,
    'a_vista',
    false
  );

  -- =========================================
  -- ORÇAMENTOS
  -- =========================================

  -- Criar orçamentos para o mês atual (novembro 2025)
  INSERT INTO public.budgets (user_id, category_id, amount, month, rollover, alert_80, alert_90, alert_100)
  VALUES
    (v_user_id, v_category_alimentacao, 600.00, DATE_TRUNC('month', CURRENT_DATE), false, true, true, true),
    (v_user_id, v_category_transporte, 400.00, DATE_TRUNC('month', CURRENT_DATE), false, true, true, true);

  RAISE NOTICE '✅ Orçamentos criados: Alimentação (R$ 600) e Transporte (R$ 400)';

  -- =========================================
  -- SEGUNDO USUÁRIO (MEMBRO DO TEAM)
  -- =========================================

  DECLARE
    v_user2_id uuid;
  BEGIN
    -- Verificar se segundo usuário já existe
    SELECT id INTO v_user2_id FROM auth.users WHERE email = 'maria@gmail.com';

    IF v_user2_id IS NULL THEN
      -- Criar segundo usuário em auth.users
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change_token_current,
        is_sso_user
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'maria@gmail.com',
        crypt('123456', gen_salt('bf')), -- Senha: 123456
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Maria Silva"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        FALSE
      ) RETURNING id INTO v_user2_id;

      RAISE NOTICE '✅ Segundo usuário criado: maria@gmail.com (senha: 123456)';
      RAISE NOTICE '📝 User ID: %', v_user2_id;
    ELSE
      RAISE NOTICE '⚠️  Usuário maria@gmail.com já existe (ID: %)', v_user2_id;
    END IF;

    -- Esperar trigger criar em public.users
    PERFORM pg_sleep(0.1);

    -- Verificar se public.users foi criado, senão criar manualmente
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user2_id) THEN
      INSERT INTO public.users (id, email, full_name)
      VALUES (v_user2_id, 'maria@gmail.com', 'Maria Silva');
      RAISE NOTICE '✅ Registro criado em public.users para Maria';
    END IF;

    -- Adicionar Maria como member na branch
    IF NOT EXISTS (SELECT 1 FROM public.branch_members WHERE user_id = v_user2_id AND branch_id = v_branch_id) THEN
      INSERT INTO public.branch_members (branch_id, user_id, role, invited_by)
      VALUES (v_branch_id, v_user2_id, 'member', v_user_id);

      RAISE NOTICE '✅ Maria Silva adicionada como member na branch';
    ELSE
      RAISE NOTICE '⚠️  Maria Silva já é membro da branch';
    END IF;
  END;

  DECLARE
    v_user_id uuid;
    v_branch_id uuid;
    v_category_transporte uuid;
    v_goal_emergency_id uuid;
    v_goal_car_id uuid;
  BEGIN

    -- Buscar usuário de teste (ruan@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ruan@gmail.com' LIMIT 1;

    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Usuário ruan@gmail.com não encontrado. Execute o seed.sql primeiro.';
    END IF;

    -- Buscar branch do usuário
    SELECT branch_id INTO v_branch_id
    FROM public.branch_members
    WHERE user_id = v_user_id AND role = 'owner'
    LIMIT 1;

    IF v_branch_id IS NULL THEN
      RAISE EXCEPTION 'Branch não encontrado para o usuário. Execute o seed.sql primeiro.';
    END IF;

    -- Buscar categoria de Transporte (para a meta do carro)
    SELECT id INTO v_category_transporte
    FROM public.categories
    WHERE branch_id = v_branch_id AND name = 'Transporte'
    LIMIT 1;

    RAISE NOTICE '📝 User ID: %', v_user_id;
    RAISE NOTICE '📝 Branch ID: %', v_branch_id;

    -- =========================================
    -- META 1: RESERVA DE EMERGÊNCIA
    -- =========================================

    -- Verificar se meta já existe
    IF EXISTS (SELECT 1 FROM public.goals WHERE user_id = v_user_id AND name = 'Reserva de Emergência') THEN
      RAISE NOTICE '⚠️  Meta "Reserva de Emergência" já existe. Pulando...';
    ELSE
      -- Criar meta de Reserva de Emergência (6k de 10k = 60%)
      INSERT INTO public.goals (
        user_id,
        branch_id,
        name,
        description,
        icon,
        goal_type,
        priority,
        target_amount,
        current_amount,
        target_date,
        is_active,
        auto_contribute,
        monthly_target
      ) VALUES (
        v_user_id,
        v_branch_id,
        'Reserva de Emergência',
        'Fundo de emergência para 6 meses de despesas',
        '🛡️',
        'emergency_fund',
        'critical',
        10000.00,
        0.00, -- Será atualizado automaticamente pelas contribuições via trigger
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '6 months',
        true,
        true,
        666.67 -- R$ 666,67/mês para atingir em 6 meses
      ) RETURNING id INTO v_goal_emergency_id;

      -- Adicionar contribuições para totalizar R$ 6.000
      INSERT INTO public.goal_contributions (goal_id, user_id, amount, notes, contributed_at)
      VALUES
        (v_goal_emergency_id, v_user_id, 2000.00, 'Contribuição inicial', CURRENT_DATE - INTERVAL '90 days'),
        (v_goal_emergency_id, v_user_id, 1500.00, 'Bônus do trabalho', CURRENT_DATE - INTERVAL '60 days'),
        (v_goal_emergency_id, v_user_id, 1000.00, 'Economias mensais', CURRENT_DATE - INTERVAL '30 days'),
        (v_goal_emergency_id, v_user_id, 1500.00, 'Economias mensais', CURRENT_DATE - INTERVAL '5 days');

      RAISE NOTICE '✅ Meta criada: Reserva de Emergência';
      RAISE NOTICE '   💰 Progresso: R$ 6.000 / R$ 10.000 (60%%)';
      RAISE NOTICE '   🎯 Meta: R$ 666,67/mês';
      RAISE NOTICE '   📅 Prazo: 6 meses';
    END IF;

    -- =========================================
    -- META 2: CARRO NOVO
    -- =========================================

    -- Verificar se meta já existe
    IF EXISTS (SELECT 1 FROM public.goals WHERE user_id = v_user_id AND name = 'Carro Novo') THEN
      RAISE NOTICE '⚠️  Meta "Carro Novo" já existe. Pulando...';
    ELSE
      -- Criar meta de Carro Novo (15k de 44k = 34%)
      INSERT INTO public.goals (
        user_id,
        branch_id,
        name,
        description,
        icon,
        goal_type,
        priority,
        target_amount,
        current_amount,
        target_date,
        is_active,
        auto_contribute,
        monthly_target,
        category_id
      ) VALUES (
        v_user_id,
        v_branch_id,
        'Carro Novo',
        'Economizar para comprar um carro 0km',
        '🚗',
        'purchase',
        'high',
        44000.00,
        0.00, -- Será atualizado automaticamente pelas contribuições via trigger
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '18 months',
        true,
        true,
        1611.11, -- R$ 1.611,11/mês para atingir em 18 meses
        v_category_transporte
      ) RETURNING id INTO v_goal_car_id;

      -- Adicionar contribuições para totalizar R$ 15.000
      INSERT INTO public.goal_contributions (goal_id, user_id, amount, notes, contributed_at)
      VALUES
        (v_goal_car_id, v_user_id, 5000.00, 'Venda do carro antigo', CURRENT_DATE - INTERVAL '120 days'),
        (v_goal_car_id, v_user_id, 3000.00, 'Economia mensal', CURRENT_DATE - INTERVAL '90 days'),
        (v_goal_car_id, v_user_id, 2500.00, 'Economia mensal', CURRENT_DATE - INTERVAL '60 days'),
        (v_goal_car_id, v_user_id, 2500.00, 'Economia mensal', CURRENT_DATE - INTERVAL '30 days'),
        (v_goal_car_id, v_user_id, 2000.00, 'Economia mensal', CURRENT_DATE - INTERVAL '5 days');

      RAISE NOTICE '✅ Meta criada: Carro Novo';
      RAISE NOTICE '   💰 Progresso: R$ 15.000 / R$ 44.000 (34%%)';
      RAISE NOTICE '   🎯 Meta: R$ 1.611,11/mês';
      RAISE NOTICE '   📅 Prazo: 18 meses';
    END IF;
  END;

  -- =========================================
  -- VERIFICAÇÃO FINAL
  -- =========================================
  DECLARE
    v_transaction_count INTEGER;
    v_category_count INTEGER;
    v_membership_verified BOOLEAN;
  BEGIN
    -- Contar transações criadas
    SELECT COUNT(*) INTO v_transaction_count
    FROM public.transactions
    WHERE user_id = v_user_id AND branch_id = v_branch_id;

    -- Contar categorias criadas
    SELECT COUNT(*) INTO v_category_count
    FROM public.categories
    WHERE user_id = v_user_id AND branch_id = v_branch_id;

    -- Verificar membership
    SELECT EXISTS(
      SELECT 1 FROM public.branch_members
      WHERE user_id = v_user_id AND branch_id = v_branch_id
    ) INTO v_membership_verified;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SEEDS CRIADOS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '👤 USUÁRIOS DE TESTE:';
    RAISE NOTICE '   1. ruan@gmail.com (Owner) - Senha: 123456';
    RAISE NOTICE '   2. maria@gmail.com (Member) - Senha: 123456';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 WORKSPACE:';
    RAISE NOTICE '   Nome: Minhas Financas';
    RAISE NOTICE '   Branch ID: %', v_branch_id;
    RAISE NOTICE '   Membros: 2 (1 owner, 1 member)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DADOS CRIADOS:';
    RAISE NOTICE '   Categorias: %', v_category_count;
    RAISE NOTICE '   Transações: %', v_transaction_count;
    RAISE NOTICE '   💰 1 receita (Salário)';
    RAISE NOTICE '   💸 6 despesas variadas';
    RAISE NOTICE '   🔄 3 recorrentes (Salário, Aluguel, Netflix)';
    RAISE NOTICE '   💳 1 parcelada (Notebook 1/12)';
    RAISE NOTICE '   💼 2 orçamentos (Alimentação: R$ 600, Transporte: R$ 400)';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 DEBUG INFO:';
    RAISE NOTICE '   Branch ID: %', v_branch_id;
    RAISE NOTICE '   Ruan ID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Acesse: http://localhost:3000/login';
    RAISE NOTICE '';

    -- Alertar se algo estiver errado
    IF v_transaction_count = 0 THEN
      RAISE WARNING '⚠️  ATENÇÃO: Nenhuma transação foi criada!';
    END IF;

    IF NOT v_membership_verified THEN
      RAISE WARNING '⚠️  ATENÇÃO: Usuário não é membro do branch!';
    END IF;
  END;

END $$;
