-- Ver transações
SELECT
  t.description,
  t.amount,
  t.due_date,
  t.type,
  c.name as category_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
ORDER BY t.due_date;

-- Ver orçamentos
SELECT
  b.amount as budget_amount,
  b.month,
  c.name as category_name
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
ORDER BY c.name;

-- Ver categorias
SELECT id, name, branch_id FROM categories ORDER BY name;
