# Tests

Sistema de testes automatizados do FinkoMoney.

## 🚀 Quick Start

```bash
# Rodar todos os testes
npm test

# Rodar testes com interface visual
npm run test:ui

# Rodar apenas testes unitários
npm run test:unit

# Rodar apenas testes de integração
npm run test:integration

# Gerar relatório de cobertura
npm run test:coverage

# Modo watch (re-run on changes)
npm run test:watch
```

## 📁 Estrutura

```
tests/
├── setup.ts                      # Configuração global dos testes
├── unit/                         # Testes unitários
│   ├── usage.service.test.ts     # Testes de limites de recursos
│   ├── features-helper.test.ts   # Testes de controle de acesso
│   └── subscription.service.test.ts # Testes de assinaturas
├── integration/                  # Testes de integração
│   └── feature-access.test.ts    # Fluxo completo de acesso a features
├── test-usage-limits.ts          # Script manual de teste (legacy)
└── test-signup.ts                # Script manual de teste (legacy)
```

## 🧪 Testes Unitários

### usage.service.test.ts
Testa o sistema de limitações de recursos.

**Cobertura:**
- ✅ `checkLimit()` - Verificação de limites por tipo de recurso
- ✅ `trackUsage()` - Incremento/decremento de uso
- ✅ `getPlanInfo()` - Informações do plano do usuário
- ✅ `hasFeatureAccess()` - Acesso a features específicas
- ✅ `resetMonthlyUsage()` - Reset de contadores mensais
- ✅ Early Adopters - Acesso ilimitado
- ✅ Diferentes tipos de recursos

**Exemplo:**
```bash
npm run test:unit -- usage.service
```

### features-helper.test.ts
Testa o sistema dinâmico de features.

**Cobertura:**
- ✅ `getAllFeatures()` - Buscar todas features
- ✅ `getPlanFeatures()` - Features de um plano específico
- ✅ `userHasFeatureAccess()` - Verificar acesso do usuário
- ✅ `getUserFeaturesWithAccess()` - Lista completa com status
- ✅ `getMinimumPlanForFeature()` - Plano mínimo necessário
- ✅ Core features sempre acessíveis
- ✅ Admins e Early Adopters - Acesso total

**Exemplo:**
```bash
npm run test:unit -- features-helper
```

### subscription.service.test.ts
Testa o sistema de assinaturas.

**Cobertura:**
- ✅ `areSubscriptionsEnabled()` - Flag de assinaturas
- ✅ `toggleSubscriptions()` - Ativar/desativar sistema
- ✅ `assignPlanToUser()` - Atribuir plano a usuário
- ✅ `getUserSubscription()` - Dados da assinatura
- ✅ `getAllPlans()` - Listar planos disponíveis
- ✅ `cancelSubscription()` - Cancelamento
- ✅ `reactivateSubscription()` - Reativação
- ✅ Webhook handling (Stripe events)

**Exemplo:**
```bash
npm run test:unit -- subscription.service
```

## 🔗 Testes de Integração

### feature-access.test.ts
Testa o fluxo completo de controle de acesso.

**Cenários:**
1. ✅ Admin - Acesso total a todas features
2. ✅ Early Adopter - Acesso vitalício ilimitado
3. ✅ Usuário Free - Features restritas pelo plano
4. ✅ Admin toggles feature - Mudança em tempo real
5. ✅ Usage limits + Feature access - Combinação

**Exemplo:**
```bash
npm run test:integration -- feature-access
```

## 📊 Relatório de Cobertura

```bash
# Gerar relatório HTML
npm run test:coverage

# Resultado em: coverage/index.html
```

**Metas de cobertura:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## 🛠️ Configuração

Veja `vitest.config.ts` para configurações avançadas:
- Environment: jsdom (para componentes React)
- Globals: true (usa `describe`, `it`, `expect` sem imports)
- Coverage provider: v8
- Setup file: `tests/setup.ts`

## 📝 Escrever Novos Testes

### Testes Unitários
```typescript
// tests/unit/my-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MyService } from '@/src/modules/my-service'

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    const result = await MyService.doSomething()
    expect(result).toBe(expected)
  })
})
```

### Testes de Integração
```typescript
// tests/integration/my-flow.test.ts
import { describe, it, expect } from 'vitest'

describe('My Integration Flow', () => {
  it('should complete end-to-end flow', async () => {
    // 1. Setup
    // 2. Execute
    // 3. Verify
  })
})
```

## 🔄 Scripts Manuais (Legacy)

### test-usage-limits.ts
Script manual para testar limites. **Requer servidor rodando.**

```bash
npm run dev  # Terminal 1
npx tsx tests/test-usage-limits.ts  # Terminal 2
```

### test-signup.ts
Script manual para testar signup. **Requer Docker/Supabase rodando.**

```bash
npx tsx tests/test-signup.ts
```

## 🎯 Boas Práticas

1. **Isolar testes**: Cada teste deve ser independente
2. **Mock externo**: Mock Supabase, Stripe, APIs externas
3. **Limpar estado**: Use `beforeEach` para reset
4. **Testes legíveis**: Nomes descritivos, AAA pattern
5. **Fast feedback**: Testes unitários devem ser rápidos (<1s)

## 🐛 Debug

```bash
# Rodar teste específico em modo debug
npm run test:watch -- my-service

# Com UI para explorar resultados
npm run test:ui
```

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
