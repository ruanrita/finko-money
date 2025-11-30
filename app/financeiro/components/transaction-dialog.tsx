"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createTransaction, updateTransaction } from "../actions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { QuickCreateCategory } from "@/components/quick-create-category";
import { CategoryIcon } from "@/components/category-icon";
import { Calendar1Icon } from "lucide-react";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  due_date: z.date(),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  payment_method: z.string().optional(),
  installment_type: z.enum(["a_vista", "parcelado"]),
  installments_count: z.string().optional(),
  is_recurring: z.boolean(),
  recurrence_type: z.enum(["monthly", "weekly", "yearly"]).optional(),
  tags: z.string().optional(),
  mark_as_paid: z.boolean().optional(),
}).refine((data) => {
  // Se is_recurring é true, recurrence_type é obrigatório
  if (data.is_recurring && !data.recurrence_type) {
    return false;
  }
  // Se installment_type é parcelado, installments_count é obrigatório
  if (data.installment_type === "parcelado" && !data.installments_count) {
    return false;
  }
  return true;
}, {
  message: "Campos obrigatórios não preenchidos",
  path: ["recurrence_type"],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string | null;
};

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  due_date: string;
  category_id: string | null;
  payment_method: string | null;
  installment_type: "a_vista" | "parcelado";
  installments_count: number | null;
  current_installment: number | null;
  is_recurring: boolean;
  recurrence_type: "monthly" | "weekly" | "yearly" | null;
  tags: string[] | null;
};

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  transaction?: Transaction | null;
  onSuccess?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  transaction,
  onSuccess,
}: TransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      installment_type: "a_vista",
      is_recurring: false,
      due_date: new Date(),
      mark_as_paid: false,
    },
  });

  const type = watch("type");
  const installmentType = watch("installment_type");

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        due_date: new Date(transaction.due_date),
        category_id: transaction.category_id || undefined,
        payment_method: transaction.payment_method || undefined,
        installment_type: transaction.installment_type,
        installments_count: transaction.installments_count?.toString() || undefined,
        is_recurring: transaction.is_recurring,
        recurrence_type: transaction.recurrence_type || undefined,
        tags: transaction.tags?.join(", ") || "",
      });
      setIsRecurring(transaction.is_recurring);
      setIsInstallment(transaction.installment_type === "parcelado");
      setSelectedDate(new Date(transaction.due_date));
    } else {
      reset({
        type: "expense",
        installment_type: "a_vista",
        is_recurring: false,
        due_date: new Date(),
      });
      setIsRecurring(false);
      setIsInstallment(false);
      setSelectedDate(new Date());
    }
  }, [transaction, reset]);

  // Watch for installment_type changes
  useEffect(() => {
    setIsInstallment(installmentType === "parcelado");
    if (installmentType === "parcelado") {
      // Se for parcelado, desabilita recorrência
      setValue("is_recurring", false);
      setIsRecurring(false);
    }
  }, [installmentType, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("amount", data.amount);
    formData.append("description", data.description);
    formData.append("due_date", format(data.due_date, "yyyy-MM-dd"));
    formData.append("installment_type", data.installment_type);
    formData.append("is_recurring", data.is_recurring.toString());

    if (data.category_id) {
      formData.append("category_id", data.category_id);
    }

    if (data.payment_method) {
      formData.append("payment_method", data.payment_method);
    }

    // Se for parcelado, enviar quantidade de parcelas
    if (data.installment_type === "parcelado" && data.installments_count) {
      formData.append("installments_count", data.installments_count);
    }

    // Se for recorrente e NÃO for parcelado
    if (data.is_recurring && data.recurrence_type && data.installment_type === "a_vista") {
      formData.append("recurrence_type", data.recurrence_type);
    }

    if (data.tags) {
      formData.append("tags", data.tags);
    }

    // Adicionar flag para marcar como pago ao criar
    if (data.mark_as_paid) {
      formData.append("mark_as_paid", "true");
    }

    const result = transaction
      ? await updateTransaction(transaction.id, formData)
      : await createTransaction(formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        transaction
          ? "Transação atualizada com sucesso!"
          : "Transação criada com sucesso!"
      );
      onOpenChange(false);
      reset();
      onSuccess?.(); // Chama callback de sucesso apenas quando salvar
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-2 border-gray-300 dark:border-gray-700">
        <DialogHeader className="pb-4 border-b-2 border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-2xl">
            {transaction ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {transaction
              ? "Atualize os dados da transação"
              : "Adicione uma nova despesa ou receita"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={type}
                onValueChange={(value) => setValue("type", value as "income" | "expense")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Valor {isInstallment ? "Total" : ""} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount")}
              />
              {isInstallment && watch("amount") && watch("installments_count") && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Cada parcela: {formatCurrency(parseFloat(watch("amount")) / parseInt(watch("installments_count") || "1"))}
                </p>
              )}
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Conta de luz, Salário..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id">Categoria</Label>
                <QuickCreateCategory
                  variant="compact"
                  onCategoryCreated={(newCategory) => {
                    setLocalCategories((prev) => [...prev, newCategory]);
                    setValue("category_id", newCategory.id);
                  }}
                />
              </div>

              <Select
                value={watch("category_id")}
                onValueChange={(value) => setValue("category_id", value)}
              >
                <SelectTrigger className="border-2 border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {localCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="h-6 w-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <CategoryIcon iconName={category.icon} className="h-4 w-4" />
                          </div>
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4 mt-3">
                <Label>Data de Vencimento *</Label>
              </div>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2 border-gray-300 dark:border-gray-700 hover:border-brand"
                  >
                    <Calendar1Icon className="mr-2 h-4 w-4 text-brand" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-gray-300 dark:border-gray-700">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setValue("due_date", date);
                        setIsCalendarOpen(false); // Fecha o popover ao selecionar
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="installment_type">Forma de Pagamento *</Label>
              <Select
                value={watch("installment_type")}
                onValueChange={(value) => setValue("installment_type", value as "a_vista" | "parcelado")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_vista">À Vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={watch("payment_method")}
                onValueChange={(value) => setValue("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="debito">Cartão de Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantidade de Parcelas (apenas se for parcelado) */}
          {isInstallment && (
            <div className="space-y-2">
              <Label htmlFor="installments_count">Quantidade de Parcelas *</Label>
              <Input
                id="installments_count"
                type="number"
                min="2"
                max="48"
                placeholder="Ex: 12"
                {...register("installments_count")}
                required
              />
              {errors.installments_count && (
                <p className="text-sm text-red-600">{errors.installments_count.message}</p>
              )}
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Será criada automaticamente uma cobrança para cada mês
              </p>
            </div>
          )}

          {/* Recorrência (apenas se NÃO for parcelado) */}
          {!isInstallment && (
            <>
              <div className="flex items-center justify-between rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="space-y-0.5">
                  <Label className="font-semibold">Transação Recorrente</Label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Esta transação se repete automaticamente?
                  </p>
                </div>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(checked);
                    setValue("is_recurring", checked);
                  }}
                />
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_type">Tipo de Recorrência *</Label>
                  <Select
                    value={watch("recurrence_type")}
                    onValueChange={(value) => setValue("recurrence_type", value as "monthly" | "weekly" | "yearly")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurrence_type && (
                    <p className="text-sm text-red-600">{errors.recurrence_type.message}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <Input
              id="tags"
              placeholder="Ex: casa, trabalho, lazer (separadas por vírgula)"
              {...register("tags")}
            />
          </div>

          {/* Status */}
          {!transaction && (
            <div className="flex items-center justify-between rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="space-y-0.5">
                <Label className="font-semibold">Marcar como Pago</Label>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Criar transação já marcada como paga
                </p>
              </div>
              <Switch
                checked={watch("mark_as_paid") || false}
                onCheckedChange={(checked) => setValue("mark_as_paid", checked)}
              />
            </div>
          )}

          <DialogFooter className="pt-4 border-t-2 border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-2 border-gray-300 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:bg-blue-700 shadow-md">
              {loading ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
