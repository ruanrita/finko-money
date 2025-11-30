"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verify2FACode } from "../login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/button-loader";

function Verify2FAContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!userId || !email) {
      toast.error("Link inválido", {
        description: "Por favor, faça login novamente.",
      });
    }
  }, [userId, email]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId || !email) {
      setError("Dados inválidos. Por favor, faça login novamente.");
      return;
    }

    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("code", code);

    const result = await verify2FACode(formData);

    if (result?.error) {
      setError(result.error);
      toast.error("Erro ao verificar código", {
        description: result.error,
      });
      setLoading(false);
    } else {
      toast.success("Código verificado!", {
        description: "Redirecionando para o dashboard...",
      });
      // Loading state permanece true pois vai redirecionar
    }
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-brand dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
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
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <Shield className="h-8 w-8 text-brand" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                Verificação de Segurança
              </CardTitle>
              <CardDescription className="text-center">
                Enviamos um código de 6 dígitos para {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={handleCodeChange}
                    required
                    disabled={loading}
                    className="h-14 text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    autoComplete="off"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    O código expira em 10 minutos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Confirme sua Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  type="submit"
                  className="btn-brand h-11 w-full"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <ButtonLoader size="md" />
                      <span className="ml-2">Verificando...</span>
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/10 dark:text-blue-200">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>
                    Não recebeu o código? Verifique sua caixa de spam ou tente fazer login
                    novamente.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              <span>Autenticação de dois fatores ativa para sua segurança</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="relative hidden bg-brand-gradient-hero lg:block">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Shield className="h-10 w-10" />
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Segurança em Primeiro Lugar
            </h2>
            <p className="text-xl text-blue-100">
              A autenticação de dois fatores adiciona uma camada extra de proteção à sua
              conta.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Proteção Avançada</h3>
                  <p className="text-sm text-blue-100">
                    Códigos temporários que expiram rapidamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Envio por Email</h3>
                  <p className="text-sm text-blue-100">
                    Receba códigos diretamente no seu email cadastrado
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="text-sm text-blue-100">Tempo de expiração do código</div>
              <div className="text-3xl font-bold">10 minutos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Verify2FAContent />
    </Suspense>
  );
}
