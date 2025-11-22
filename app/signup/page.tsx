"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "../login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-brand dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-brand">FinkoMoney</span>
          </div>

          {/* Form Card */}
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Grátis
                </Badge>
              </div>
              <CardDescription>
                Preencha os dados abaixo e comece a organizar suas finanças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading}
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Senha</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    required
                    disabled={loading}
                    minLength={6}
                    className="h-11"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                    {error}
                  </div>
                )}
                <Button type="submit" className="btn-brand h-11 w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta grátis"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-semibold text-brand hover:underline">
                  Fazer login
                </Link>
              </div>

              <p className="mt-4 text-center text-xs text-zinc-500">
                Ao criar uma conta, você concorda com nossos{" "}
                <Link href="#" className="text-brand hover:underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link href="#" className="text-brand hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              O que você ganha gratuitamente:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Check className="h-4 w-4" />
                <span>Dashboard completo de finanças</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Check className="h-4 w-4" />
                <span>Até 50 transações por mês</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Check className="h-4 w-4" />
                <span>Relatórios e gráficos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="relative hidden bg-brand-gradient-hero lg:block">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <Badge className="w-fit bg-white/20 px-4 py-2 text-white hover:bg-white/30">
              <Sparkles className="mr-1 h-4 w-4" />
              Teste Premium por 30 dias grátis
            </Badge>

            <h2 className="text-4xl font-bold leading-tight">
              Comece sua jornada financeira hoje mesmo
            </h2>
            <p className="text-xl text-blue-100">
              Mais de 2.000 pessoas já organizaram suas finanças com o FinkoMoney
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400">
                  <Check className="h-5 w-5 text-green-900" />
                </div>
                <div>
                  <h3 className="font-semibold">Cadastro em 1 minuto</h3>
                  <p className="text-sm text-blue-100">
                    Processo rápido e sem burocracia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400">
                  <Check className="h-5 w-5 text-green-900" />
                </div>
                <div>
                  <h3 className="font-semibold">Sem cartão de crédito</h3>
                  <p className="text-sm text-blue-100">
                    Comece grátis, faça upgrade quando quiser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400">
                  <Check className="h-5 w-5 text-green-900" />
                </div>
                <div>
                  <h3 className="font-semibold">Acesso imediato</h3>
                  <p className="text-sm text-blue-100">
                    Use todas as funcionalidades na hora
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400">
                  <Check className="h-5 w-5 text-green-900" />
                </div>
                <div>
                  <h3 className="font-semibold">Cancele quando quiser</h3>
                  <p className="text-sm text-blue-100">
                    Sem compromisso, sem pegadinhas
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="mb-3 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm italic">
                "Melhor ferramenta de controle financeiro que já usei. Simples, intuitiva e completa!"
              </p>
              <p className="mt-2 text-sm font-semibold">
                - Maria Silva, Freelancer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
