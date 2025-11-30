# Exemplos de Integração - Sistema de Limitações

Este documento mostra como integrar o sistema de limitações de recursos nos componentes existentes.

## 1. Integração em Formulários de Criação

### Exemplo: Transaction Dialog

```tsx
// app/financeiro/components/transaction-dialog.tsx
"use client";

import { useUsageLimit } from "@/hooks/useUsageLimit";

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  transaction,
  onSuccess,
}: TransactionDialogProps) {
  // Adicionar hook de verificação de limite
  const { canCreate, usageInfo, isLoading } = useUsageLimit('transaction');

  // ... resto do código do componente

  const onSubmit = async (data: TransactionFormData) => {
    // Verificar limite ANTES de criar
    if (!canCreate()) {
      return; // Hook já mostra toast de erro
    }

    setLoading(true);
    try {
      // ... lógica de criação
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          {/* Mostrar uso atual */}
          {usageInfo && usageInfo.limit && (
            <DialogDescription>
              {usageInfo.current} de {usageInfo.limit} transações este mês
              ({usageInfo.percentage}%)
            </DialogDescription>
          )}
        </DialogHeader>
        {/* ... resto do formulário */}
      </DialogContent>
    </Dialog>
  );
}
```

### Exemplo: Categoria Dialog

```tsx
// components/category-dialog.tsx
"use client";

import { useUsageLimit } from "@/hooks/useUsageLimit";

export function CategoryDialog({ open, onOpenChange, onSuccess }) {
  const { canCreate, usageInfo } = useUsageLimit('category');

  const handleSubmit = async (data) => {
    if (!canCreate()) return;

    // Criar categoria...
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Indicador de limite */}
      {usageInfo && usageInfo.percentage && usageInfo.percentage > 80 && (
        <Alert variant="warning">
          Você usou {usageInfo.percentage}% do seu limite de categorias
        </Alert>
      )}
      {/* Formulário */}
    </Dialog>
  );
}
```

## 2. Integração em Botões de Ação

### Exemplo: Botão "Nova Transação"

```tsx
// app/financeiro/page.tsx
"use client";

import { useUsageLimit } from "@/hooks/useUsageLimit";

export default function FinanceiroPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canCreate, usageInfo } = useUsageLimit('transaction');

  const handleNewTransaction = () => {
    if (!canCreate()) {
      return; // Hook mostra toast automático
    }
    setDialogOpen(true);
  };

  return (
    <div>
      <Button onClick={handleNewTransaction}>
        Nova Transação
      </Button>

      {/* Badge de uso */}
      {usageInfo && usageInfo.limit && (
        <Badge variant={usageInfo.percentage! > 80 ? "destructive" : "secondary"}>
          {usageInfo.current}/{usageInfo.limit}
        </Badge>
      )}
    </div>
  );
}
```

## 3. Verificação de Features

### Exemplo: Exportação de Relatórios

```tsx
// components/export-menu.tsx
"use client";

import { useFeatureAccess } from "@/hooks/useUsageLimit";

export function ExportMenu() {
  const { hasAccess: canExportPDF } = useFeatureAccess('export_pdf');
  const { hasAccess: canExportExcel } = useFeatureAccess('export_excel');
  const { hasAccess: canExportCSV } = useFeatureAccess('export_csv');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Exportar</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleExportCSV}
          disabled={!canExportCSV}
        >
          Exportar CSV
          {!canExportCSV && <Lock className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleExportPDF}
          disabled={!canExportPDF}
        >
          Exportar PDF
          {!canExportPDF && <Lock className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleExportExcel}
          disabled={!canExportExcel}
        >
          Exportar Excel
          {!canExportExcel && <Lock className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 4. Página de Configurações - Mostrar Plano Atual

### Exemplo: Settings Page

```tsx
// app/settings/page.tsx
"use client";

import { useUserPlan } from "@/hooks/useUsageLimit";

export default function SettingsPage() {
  const { plan, isEarlyAdopter, isLoading } = useUserPlan();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h2>Seu Plano</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {plan?.display_name}
            {isEarlyAdopter && (
              <Badge variant="success">Early Adopter 🎉</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Transações/mês: {plan?.max_transactions || 'Ilimitado'}</p>
            <p>Categorias: {plan?.max_categories || 'Ilimitado'}</p>
            <p>Metas: {plan?.max_goals || 'Ilimitado'}</p>
            <p>Orçamentos: {plan?.max_budgets || 'Ilimitado'}</p>
            <p>Membros da equipe: {plan?.max_team_members || 'Ilimitado'}</p>
            <p>Branches: {plan?.max_branches || 'Ilimitado'}</p>
            <p>Lembretes: {plan?.max_reminders || 'Ilimitado'}</p>
          </div>

          {!isEarlyAdopter && (
            <Button className="mt-4" onClick={() => router.push('/pricing')}>
              Fazer Upgrade
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 5. Dashboard - Widget de Uso

### Exemplo: Usage Widget

```tsx
// components/usage-widget.tsx
"use client";

import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Progress } from "@/components/ui/progress";

export function UsageWidget() {
  const transactions = useUsageLimit('transaction');
  const categories = useUsageLimit('category');
  const goals = useUsageLimit('goal');
  const budgets = useUsageLimit('budget');

  const resources = [
    { name: 'Transações', ...transactions.usageInfo },
    { name: 'Categorias', ...categories.usageInfo },
    { name: 'Metas', ...goals.usageInfo },
    { name: 'Orçamentos', ...budgets.usageInfo },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de Recursos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource) => (
          resource.limit && (
            <div key={resource.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{resource.name}</span>
                <span className="text-sm text-muted-foreground">
                  {resource.current}/{resource.limit}
                </span>
              </div>
              <Progress
                value={resource.percentage}
                className={resource.percentage! > 80 ? "bg-destructive" : ""}
              />
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
```

## 6. Validação no Backend (Server Actions)

### Exemplo: Create Transaction Action

```ts
// app/financeiro/actions.ts
"use server";

import { UsageService } from "@/src/modules/usage/usage.service";

export async function createTransaction(data: TransactionData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  // Verificar limite no backend (segurança)
  const usageCheck = await UsageService.checkUsageLimit(
    user.id,
    'transaction',
    data.branch_id
  );

  if (!usageCheck.allowed) {
    throw new Error(
      `Limite de ${usageCheck.limit} transações atingido. ` +
      `Faça upgrade do seu plano para continuar.`
    );
  }

  // Criar transação...
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return transaction;
}
```

## 7. API Routes com Verificação

### Exemplo: POST /api/categories

```ts
// app/api/categories/route.ts
import { UsageService } from "@/src/modules/usage/usage.service";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const currentBranch = await getCurrentBranch(user.id);

  // Verificar limite
  const usageCheck = await UsageService.checkUsageLimit(
    user.id,
    'category',
    currentBranch.id
  );

  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        error: `Limite de ${usageCheck.limit} categorias atingido`,
        code: 'LIMIT_REACHED',
        limit: usageCheck.limit,
        current: usageCheck.current,
      },
      { status: 403 }
    );
  }

  // Criar categoria...
  const body = await request.json();
  const category = await CategoryService.create(user.id, currentBranch.id, body);

  return NextResponse.json({ data: category }, { status: 201 });
}
```

## 8. Mensagens de Erro Customizadas

### Exemplo: Custom Error Toast

```tsx
// components/limit-reached-dialog.tsx
export function LimitReachedDialog({ resource, limit, planName }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limite Atingido</DialogTitle>
        </DialogHeader>
        <p>
          Você atingiu o limite de {limit} {resource} do plano {planName}.
        </p>
        <DialogFooter>
          <Button onClick={() => router.push('/pricing')}>
            Ver Planos
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Resumo de Boas Práticas

1. **Sempre verificar no frontend E backend**: Segurança em camadas
2. **Usar toasts informativos**: Usuário sabe o que está acontecendo
3. **Mostrar progresso de uso**: Transparência aumenta confiança
4. **Oferecer upgrade facilmente**: Botão "Ver Planos" sempre visível
5. **Fail-safe**: Se verificação falhar, permitir (melhor UX)
6. **Avisar em 80%**: Usuário não é pego de surpresa
7. **Cache de verificações**: Não fazer fetch a cada render (use o hook)
8. **Refetch após criar**: Atualizar contadores após ações

## Próximos Passos

1. Integrar nos componentes principais (transações, categorias, etc.)
2. Criar página de pricing (/pricing)
3. Adicionar widget de uso no dashboard
4. Testar todos os fluxos de limitação
5. Preparar para Fase 2 (Stripe)
