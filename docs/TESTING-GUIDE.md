# 🧪 Guia de Testes - FinkoMoney

Sistema completo de testes automatizados para garantir qualidade e confiabilidade do código.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Executando Testes](#executando-testes)
- [Estrutura de Testes](#estrutura-de-testes)
- [Testes Implementados](#testes-implementados)
- [Escrevendo Novos Testes](#escrevendo-novos-testes)
- [CI/CD Integration](#cicd-integration)

## 🎯 Visão Geral

O FinkoMoney usa **Vitest** como framework de testes, oferecendo:

- ⚡ **Performance**: Extremamente rápido com HMR
- 🔄 **Watch Mode**: Re-run automático ao salvar
- 📊 **Coverage**: Relatórios detalhados de cobertura
- 🎨 **UI Mode**: Interface visual para debug
- 🧩 **Mocking**: Sistema poderoso de mocks

## ⚙️ Configuração

### Instalação

Todas as dependências já estão instaladas via `package.json`:

```bash
npm install
```

### Arquivos de Configuração

**vitest.config.ts** - Configuração principal
```typescript
{
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./tests/setup.ts']
}
```

**tests/setup.ts** - Setup global
- Mocks de Next.js (router, headers, etc.)
- Environment variables de teste
- Cleanup automático após cada teste

## 🚀 Executando Testes

### Comandos Principais

```bash
# Rodar todos os testes uma vez
npm test -- --run

# Modo watch (recomendado para desenvolvimento)
npm run test:watch

# Interface visual interativa
npm run test:ui

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Gerar relatório de cobertura
npm run test:coverage
```

### Exemplos de Uso

```bash
# Rodar arquivo específico
npm test -- usage.service.test.ts

# Rodar testes que contêm "features" no nome
npm test -- features

# Modo watch para arquivo específico
npm run test:watch -- usage.service
```

## 📁 Estrutura de Testes

```
tests/
├── setup.ts                          # Setup global
├── unit/                             # Testes unitários
│   ├── usage.service.test.ts         # 17 testes
│   ├── features-helper.test.ts       # 15 testes
│   └── subscription.service.test.ts  # 13 testes
├── integration/                      # Testes de integração
│   └── feature-access.test.ts        # 6 cenários
└── README.md                         # Documentação completa
```

## ✅ Testes Implementados

### 1. UsageService (7 testes) ✅

**Arquivo:** `tests/unit/usage.service.test.ts`

Testa a estrutura e exportações do módulo de limites de recursos:

- ✅ Exporta a classe UsageService
- ✅ Possui método checkUsageLimit
- ✅ Possui método hasFeatureAccess
- ✅ Possui método getUserPlan
- ✅ Interface UsageLimitResult está correta
- ✅ Interface FeatureAccess está correta
- ✅ ResourceType é válido

**Executar:**
```bash
npm run test:unit -- usage.service
```

**Nota:** Para testes funcionais completos, use testes de integração com banco de dados real.

### 2. Features Helper (15 testes) ✅

**Arquivo:** `tests/unit/features-helper.test.ts`

Testa o controle dinâmico de acesso a features:

- ✅ `getAllFeatures()` - Retorna todas features ordenadas
- ✅ `getAllFeatures()` - Retorna array vazio em erro
- ✅ `getPlanFeatures()` - Retorna features de um plano específico
- ✅ `getPlanFeatures()` - Filtra features nulas
- ✅ `userHasFeatureAccess()` - Retorna true para admins
- ✅ `userHasFeatureAccess()` - Retorna true para early adopters
- ✅ `userHasFeatureAccess()` - Retorna false para usuários sem acesso
- ✅ `userHasFeatureAccess()` - Retorna true para core features
- ✅ `userHasFeatureAccess()` - Fail open em erro (permite acesso)
- ✅ `getUserFeaturesWithAccess()` - Função está definida
- ✅ `getUserFeaturesWithAccess()` - Retorna estrutura UserFeatureAccess
- ✅ `getMinimumPlanForFeature()` - Função está definida
- ✅ `getMinimumPlanForFeature()` - Retorna null para core features
- ✅ `getMinimumPlanForFeature()` - Retorna null se feature não existe
- ✅ `getMinimumPlanForFeature()` - Retorna null se nenhum plano inclui feature

**Executar:**
```bash
npm run test:unit -- features-helper
```

### 3. SubscriptionService (14 testes) ✅

**Arquivo:** `tests/unit/subscription.service.test.ts`

Testa a estrutura e métodos do sistema de assinaturas:

- ✅ Exporta a classe SubscriptionService
- ✅ Possui método areSubscriptionsEnabled
- ✅ Possui método enableSubscriptions
- ✅ Possui método disableSubscriptions
- ✅ Possui método cancelSubscription
- ✅ Possui método createCheckoutSession
- ✅ Possui método getOrCreateStripeCustomer
- ✅ Possui método createCustomerPortal
- ✅ Estado de assinatura ativa
- ✅ Estado de assinatura cancelada
- ✅ Estado de early adopter (grandfathered)
- ✅ Reconhece plano free
- ✅ Reconhece plano pro
- ✅ Reconhece plano initial_launch

**Executar:**
```bash
npm run test:unit -- subscription.service
```

**Nota:** Para testes com Stripe real, use testes de integração e Stripe CLI para webhooks.

### 4. Feature Access Integration (5 cenários) ✅

**Arquivo:** `tests/integration/feature-access.test.ts`

Testa fluxos completos end-to-end:

- ✅ Admin - Acesso total a todas features
- ✅ Free User - Features restritas pelo plano
- ✅ Early Adopter - Acesso vitalício ilimitado
- ✅ Admin toggles feature - Inserção e remoção de features
- ✅ Usage limits + Feature access - Verificação combinada

**Executar:**
```bash
npm run test:integration -- feature-access
```

## 🆕 Escrevendo Novos Testes

### Template de Teste Unitário

```typescript
// tests/unit/my-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MyService } from '@/src/modules/my-service'

// Mock dependencies
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockSupabase,
}))

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('myMethod', () => {
    it('should return expected result', async () => {
      // Arrange
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: '123', name: 'Test' },
        error: null,
      })

      // Act
      const result = await MyService.myMethod('123')

      // Assert
      expect(result).toEqual({ id: '123', name: 'Test' })
      expect(mockSupabase.from).toHaveBeenCalledWith('my_table')
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      })

      // Act & Assert
      await expect(MyService.myMethod('999')).rejects.toThrow()
    })
  })
})
```

### Template de Teste de Integração

```typescript
// tests/integration/my-flow.test.ts
import { describe, it, expect } from 'vitest'

describe('My Feature Flow', () => {
  it('should complete full user journey', async () => {
    // 1. Setup - Prepare test data
    const userId = 'test-user-123'

    // 2. Execute - Run the flow
    // ... multiple service calls

    // 3. Verify - Check final state
    expect(finalState).toMatchObject({
      success: true,
      userId,
    })
  })
})
```

## 📊 Relatórios de Cobertura

### Gerar Relatório

```bash
npm run test:coverage
```

### Visualizar

Abra `coverage/index.html` no navegador para ver:

- % de linhas cobertas
- % de branches cobertos
- % de funções cobertas
- Arquivos não testados
- Linhas específicas não cobertas

### Metas de Cobertura

```
Statements   : > 80%
Branches     : > 75%
Functions    : > 80%
Lines        : > 80%
```

## 🔄 CI/CD Integration

### GitHub Actions

Adicione ao `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 🐛 Debug de Testes

### Modo Watch com UI

Melhor experiência para debug:

```bash
npm run test:ui
```

Acesse http://localhost:51204/__vitest__/ para:
- Ver resultados em tempo real
- Executar testes individuais
- Inspecionar snapshots
- Ver stack traces completos

### Console Logs

Use `console.log` normalmente nos testes:

```typescript
it('should debug values', () => {
  const result = myFunction()
  console.log('Result:', result) // Será mostrado no output
  expect(result).toBe(expected)
})
```

### Teste Específico

Focar em um teste específico:

```typescript
it.only('should run only this test', () => {
  // Este é o único teste que vai rodar
})
```

Pular um teste temporariamente:

```typescript
it.skip('should skip this test', () => {
  // Este teste será pulado
})
```

## 📝 Boas Práticas

### 1. Arrange-Act-Assert (AAA)

```typescript
it('should calculate total', () => {
  // Arrange
  const items = [10, 20, 30]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(60)
})
```

### 2. Testes Independentes

Cada teste deve ser completamente independente:

```typescript
beforeEach(() => {
  vi.clearAllMocks() // Limpar mocks
  // Reset de estado se necessário
})
```

### 3. Nomes Descritivos

```typescript
// ❌ Ruim
it('works', () => { ... })

// ✅ Bom
it('should return user data when user exists', () => { ... })
```

### 4. Um Conceito por Teste

```typescript
// ❌ Ruim - testa múltiplas coisas
it('should work', () => {
  expect(func1()).toBe(true)
  expect(func2()).toBe(false)
  expect(func3()).toBe(null)
})

// ✅ Bom - um teste por conceito
it('should return true for valid input', () => {
  expect(func1()).toBe(true)
})

it('should return false for invalid input', () => {
  expect(func2()).toBe(false)
})
```

### 5. Evitar Testes Frágeis

```typescript
// ❌ Ruim - depende de tempo
it('should return current date', () => {
  expect(getDate()).toBe('2025-11-29') // Quebra amanhã
})

// ✅ Bom - testa comportamento
it('should return current date in ISO format', () => {
  const date = getDate()
  expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})
```

## 🎓 Recursos de Aprendizado

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Driven Development](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

## 🆘 Troubleshooting

### Testes Lentos

Se os testes estiverem lentos:

```bash
# Rodar em modo sequencial (sem paralelização)
npm test -- --no-threads

# Ver tempo de cada teste
npm test -- --reporter=verbose
```

### Mocks Não Funcionam

Verifique se está fazendo mock **antes** do import:

```typescript
// ✅ Correto
vi.mock('@/lib/supabase/server')
import { myFunction } from '@/my-module'

// ❌ Errado
import { myFunction } from '@/my-module'
vi.mock('@/lib/supabase/server') // Tarde demais
```

### Erro de Timeout

Aumentar timeout para testes assíncronos:

```typescript
it('should handle slow operation', async () => {
  // ... teste lento
}, 10000) // 10 segundos
```

## 📈 Roadmap de Testes

### Próximos Passos

- [ ] Testes para componentes React
- [ ] Testes E2E com Playwright
- [ ] Testes de performance
- [ ] Testes de acessibilidade
- [ ] Snapshot testing
- [ ] Visual regression testing

### Prioridades

1. **Alta**: Cobrir serviços críticos (auth, payments)
2. **Média**: Testar utilitários e helpers
3. **Baixa**: Testes de UI/componentes visuais

---

**Última atualização:** 2025-11-29
**Versão:** 1.0.0
**Autor:** FinkoMoney Team
