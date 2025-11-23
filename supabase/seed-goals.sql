-- =========================================
-- SEED GOALS - METAS FINANCEIRAS
-- =========================================
-- Este arquivo adiciona metas de exemplo ao seed principal
-- Execute após o seed.sql principal
-- =========================================

DO $$
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

  -- =========================================
  -- RESUMO
  -- =========================================

  DECLARE
    v_total_goals INTEGER;
    v_total_target DECIMAL;
    v_total_current DECIMAL;
  BEGIN
    SELECT
      COUNT(*),
      SUM(target_amount),
      SUM(current_amount)
    INTO v_total_goals, v_total_target, v_total_current
    FROM public.goals
    WHERE user_id = v_user_id AND branch_id = v_branch_id;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ METAS CRIADAS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESUMO:';
    RAISE NOTICE '   Total de metas: %', v_total_goals;
    RAISE NOTICE '   Valor total alvo: R$ %', v_total_target;
    RAISE NOTICE '   Valor total atual: R$ %', v_total_current;
    RAISE NOTICE '   Progresso geral: %%', ROUND((v_total_current / v_total_target) * 100, 1);
    RAISE NOTICE '';
  END;

END $$;
