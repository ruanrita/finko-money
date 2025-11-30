-- Script para adicionar categorias padrão em branches sem categorias
-- Execute este script quando um branch não tiver categorias padrão

DO $$
DECLARE
  branch_record RECORD;
  user_record RECORD;
  category_count INTEGER;
BEGIN
  -- Para cada branch que não tem categorias
  FOR branch_record IN
    SELECT DISTINCT b.id as branch_id, bm.user_id
    FROM branches b
    JOIN branch_members bm ON b.id = bm.branch_id
    WHERE bm.role = 'owner'
  LOOP
    -- Contar quantas categorias existem neste branch
    SELECT COUNT(*) INTO category_count
    FROM categories
    WHERE branch_id = branch_record.branch_id;

    -- Se não tem categorias, criar as padrão
    IF category_count = 0 THEN
      RAISE NOTICE 'Criando categorias para branch % (user %)', branch_record.branch_id, branch_record.user_id;

      INSERT INTO categories (user_id, branch_id, name, color, icon) VALUES
        (branch_record.user_id, branch_record.branch_id, 'Alimentacao', '#ef4444', 'Utensils'),
        (branch_record.user_id, branch_record.branch_id, 'Transporte', '#3b82f6', 'Car'),
        (branch_record.user_id, branch_record.branch_id, 'Moradia', '#8b5cf6', 'Home'),
        (branch_record.user_id, branch_record.branch_id, 'Lazer', '#ec4899', 'Gamepad2'),
        (branch_record.user_id, branch_record.branch_id, 'Saude', '#10b981', 'Heart'),
        (branch_record.user_id, branch_record.branch_id, 'Educacao', '#f59e0b', 'GraduationCap'),
        (branch_record.user_id, branch_record.branch_id, 'Assinaturas', '#6366f1', 'ShoppingCart'),
        (branch_record.user_id, branch_record.branch_id, 'Outros', '#6b7280', 'DollarSign');
    ELSE
      RAISE NOTICE 'Branch % já tem % categorias', branch_record.branch_id, category_count;
    END IF;
  END LOOP;
END $$;

-- Verificar resultados
SELECT
  b.name as branch_name,
  COUNT(c.id) as category_count,
  u.email as owner_email
FROM branches b
JOIN branch_members bm ON b.id = bm.branch_id AND bm.role = 'owner'
JOIN users u ON bm.user_id = u.id
LEFT JOIN categories c ON b.id = c.branch_id
GROUP BY b.id, b.name, u.email
ORDER BY u.email, b.name;
