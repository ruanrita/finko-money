"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, TrendingUp, Target, Shield } from "lucide-react";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/button-loader";
import { formatError } from "@/lib/error-messages";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      const friendlyError = formatError(result.error);
      setError(friendlyError);
      toast.error("Erro ao fazer login", {
        description: friendlyError,
      });
      setLoading(false);
    } else if (result?.requires2FA) {
      // Admin precisa verificar código 2FA
      toast.success("Código de verificação enviado!", {
        description: "Verifique seu email e insira o código.",
      });

      // Redireciona para página de verificação 2FA
      const params = new URLSearchParams({
        userId: result.userId,
        email: result.email,
      });
      router.push(`/verify-2fa?${params.toString()}`);
    } else {
      toast.success("Login realizado com sucesso!", {
        description: "Redirecionando para o dashboard...",
      });
      // Loading state permanece true pois vai redirecionar
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
              <CardTitle className="text-2xl font-bold">Bem-vindo de volta!</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="#"
                      className="text-sm text-brand hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                    {error}
                  </div>
                )}
                <Button type="submit" className="btn-brand h-11 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <ButtonLoader size="md" />
                      <span className="ml-2">Entrando...</span>
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/signup" className="font-semibold text-brand hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              <span>Seus dados estão seguros e criptografados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="relative hidden bg-brand-gradient-hero lg:block">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              Organize suas finanças de forma simples e inteligente
            </h2>
            <p className="text-xl text-blue-100">
              Controle completo de despesas, receitas, metas e orçamentos em um único lugar.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Relatórios Detalhados</h3>
                  <p className="text-sm text-blue-100">
                    Visualize seus gastos e tome decisões inteligentes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Metas Financeiras</h3>
                  <p className="text-sm text-blue-100">
                    Defina objetivos e acompanhe seu progresso
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">100% Seguro</h3>
                  <p className="text-sm text-blue-100">
                    Seus dados protegidos com criptografia de ponta
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/10 p-6 backdrop-blur">
              <div>
                <div className="text-3xl font-bold">2K+</div>
                <div className="text-sm text-blue-100">Usuários</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-blue-100">Transações</div>
              </div>
              <div>
                <div className="text-3xl font-bold">R$ 2M+</div>
                <div className="text-sm text-blue-100">Gerenciado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
