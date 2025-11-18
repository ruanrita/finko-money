import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">FinkoMoney</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              Controle Financeiro
              <br />
              <span className="text-indigo-600">Simples e Eficiente</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Toda a sua vida financeira organizada em um único lugar.
              Gerencie despesas, receitas e orçamentos sem complicação.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg">Começar Agora</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Fazer Login</Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Despesas Recorrentes</CardTitle>
                <CardDescription>
                  Cadastre suas contas fixas uma vez e elas se repetem automaticamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lembretes Inteligentes</CardTitle>
                <CardDescription>
                  Receba alertas antes dos vencimentos e nunca mais pague juros
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visão Mensal Clara</CardTitle>
                <CardDescription>
                  Saiba exatamente quanto vai gastar no próximo mês
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA */}
          <div className="mt-24 rounded-2xl bg-indigo-600 px-6 py-16 text-center sm:px-16">
            <h3 className="text-3xl font-bold tracking-tight text-white">
              Pronto para organizar suas finanças?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Comece gratuitamente e tenha controle total do seu dinheiro
            </p>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="mt-8 bg-white text-indigo-600 hover:bg-zinc-100">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500">
            © 2025 FinkoMoney. Controle fácil, escolhas melhores.
          </p>
        </div>
      </footer>
    </div>
  );
}
