# Tests

Pasta para testes do sistema.

## Scripts de Teste

### test-usage-limits.ts
Testa o sistema de limitações de recursos.

**Como executar:**
```bash
# Certifique-se que o Docker está rodando e o servidor Next.js está ativo
npm run dev

# Em outro terminal
npx tsx tests/test-usage-limits.ts
```

**O que testa:**
- Verificação de limites para todos os recursos (transações, categorias, metas, etc.)
- Informações do plano do usuário
- Acesso a features (export_csv, export_pdf, etc.)

---

### test-signup.ts
Testa o fluxo completo de signup de usuário.

**Como executar:**
```bash
# Certifique-se que o Docker está rodando
npx tsx tests/test-signup.ts
```

**O que testa:**
- Criação de usuário via auth.signUp()
- Trigger handle_new_user (criação em public.users)
- Trigger assign_initial_plan (atribuição automática de plano)
- Sistema de Early Adopters (se assinaturas desativadas)
- Sistema de plano Free (se assinaturas ativadas)

**Resultado esperado:**
```
✅ Usuário criado no auth.users
✅ Perfil criado em public.users
✅ Plano atribuído: Lançamento Inicial (se assinaturas desativadas)
✅ Early Adopter: true
✅ Status: active
```

---

## Adicionar Novos Testes

Crie novos arquivos de teste nesta pasta seguindo o padrão:
- `test-nome-do-modulo.ts` para testes backend
- `test-nome-do-componente.test.tsx` para testes de componentes React
