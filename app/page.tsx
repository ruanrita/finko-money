import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Target,
  Users,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand">FinkoMoney</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-brand hover:bg-blue-50">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="btn-brand">
                Começar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-gradient-hero py-20 sm:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                <Sparkles className="mr-1 h-3 w-3" />
                Teste grátis por 30 dias
              </Badge> */}
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
                Controle Financeiro
                <br />
                <span className="text-green-300">Simples e Eficiente</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-blue-100">
                Toda a sua vida financeira organizada em um único lugar.
                Gerencie despesas, receitas, metas e orçamentos sem complicação.
              </p>
              <div className="mt-10 flex items-center justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg" className="h-12 bg-white px-8 text-lg font-semibold text-blue-600 shadow-brand-lg hover:bg-blue-50">
                    Começar Grátis Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                {/* <Link href="#pricing">
                  <Button variant="outline" size="lg" className="h-12 border-2 border-white bg-transparent px-8 text-lg text-white hover:bg-white/10">
                    Ver Preços
                  </Button>
                </Link> */}
              </div>
              {/* <p className="mt-4 text-sm text-blue-200">
                ✨ Sem cartão de crédito • Cancele quando quiser
              </p> */}
            </div>

            {/* Hero Image/Dashboard Preview */}
            <div className="mt-16 rounded-xl bg-white/10 p-2 shadow-brand-lg backdrop-blur">
              <div className="rounded-lg bg-white p-8 shadow-2xl">
                <h1 className="text-4xl mb-4 font-semibold text-zinc-700">Dashboard</h1>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                  <div className="rounded-lg border-2 border-green-200 bg-white p-4">
                    <div className="text-sm font-medium text-zinc-600">Receitas</div>
                    <div className="mt-2 text-3xl font-bold text-green-600">R$ 12.500</div>
                  </div>
                  <div className="rounded-lg border-2 border-red-200 bg-white p-4">
                    <div className="text-sm font-medium text-zinc-600">Despesas</div>
                    <div className="mt-2 text-3xl font-bold text-red-600">R$ 8.340</div>
                  </div>
                  <div className="rounded-lg border-2 border-blue-200 bg-white p-4">
                    <div className="text-sm font-medium text-zinc-600">Saldo</div>
                    <div className="mt-2 text-3xl font-bold text-brand">R$ 4.160</div>
                  </div>
                </div>

                {/* Grid Layout: Transactions + Goals */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Metas Financeiras */}
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">Metas Financeiras</h3>
                    <div className="space-y-4">
                      {/* Meta: Carro Novo */}
                      <div className="rounded-lg border-2 border-blue-100 bg-white p-4 hover:border-brand transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🚗</span>
                            <div>
                              <div className="font-semibold text-zinc-900 text-sm">Carro Novo</div>
                              <div className="text-xs text-zinc-500">R$ 15.000 de R$ 45.000</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-brand">33%</div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{width: '33.3%'}}></div>
                        </div>
                      </div>

                      {/* Meta: Reserva de Emergência */}
                      <div className="rounded-lg border-2 border-blue-100 bg-white p-4 hover:border-brand transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🚨</span>
                            <div>
                              <div className="font-semibold text-zinc-900 text-sm">Reserva de Emergência</div>
                              <div className="text-xs text-zinc-500">R$ 6.000 de R$ 10.000</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-brand">60%</div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Próximas Transações */}
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">Próximas Transações</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border-2 border-zinc-100 p-3 hover:border-brand transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                            <span className="text-red-600 font-semibold text-sm">🏠</span>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 text-sm">Aluguel</div>
                            <div className="text-xs text-zinc-500">Venc. 05/12</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-red-600">-R$ 2.500</div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border-2 border-zinc-100 p-3 hover:border-brand transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <span className="text-green-600 font-semibold text-sm">💼</span>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 text-sm">Salário</div>
                            <div className="text-xs text-zinc-500">Venc. 05/12</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-green-600">+R$ 8.500</div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border-2 border-zinc-100 p-3 hover:border-brand transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                            <span className="text-red-600 font-semibold text-sm">🛒</span>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 text-sm">Supermercado</div>
                            <div className="text-xs text-zinc-500">Venc. 10/12</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-red-600">-R$ 840</div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border-2 border-zinc-100 p-3 hover:border-brand transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <span className="text-green-600 font-semibold text-sm">📊</span>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 text-sm">Freelance</div>
                            <div className="text-xs text-zinc-500">Venc. 15/12</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-green-600">+R$ 4.000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white py-24 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-brand">Features</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Tudo que você precisa em um só lugar
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                Ferramentas poderosas para transformar sua relação com o dinheiro
              </p>
            </div>

            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <BarChart3 className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Relatórios Detalhados</CardTitle>
                  <CardDescription>
                    Visualize seus gastos por categoria, período e tendências. Tome decisões baseadas em dados reais.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Target className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Metas Financeiras</CardTitle>
                  <CardDescription>
                    Defina objetivos e acompanhe seu progresso. Reserva de emergência, viagem, carro novo ou aposentadoria.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Workspaces Colaborativos</CardTitle>
                  <CardDescription>
                    Gerencie finanças pessoais, familiares e empresariais separadamente. Convide membros da equipe.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <TrendingUp className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Orçamentos Inteligentes</CardTitle>
                  <CardDescription>
                    Planeje seus gastos por categoria e receba alertas quando estiver próximo do limite.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 5 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Shield className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Segurança Total</CardTitle>
                  <CardDescription>
                    Seus dados criptografados e protegidos. Autenticação segura e backups automáticos.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 6 */}
              <Card className="border-blue-100 transition-all hover:shadow-brand dark:border-blue-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Zap className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle>Transações Rápidas</CardTitle>
                  <CardDescription>
                    Cadastre despesas e receitas em segundos. Suporte a parcelamento, recorrência e categorização.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section - Temporariamente desativado */}
        {/* <section id="pricing" className="bg-zinc-50 py-24 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-brand">Preços</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Escolha o plano ideal para você
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                Comece grátis e faça upgrade quando precisar de mais recursos
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {/* FREE Plan*/}
              {/*
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Básico</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">R$ 0</span>
                    <span className="text-zinc-600 dark:text-zinc-400">/mês</span>
                  </div>
                  <CardDescription className="mt-4">
                    Ideal para uso pessoal e teste da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>1 workspace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>50 transações/mês</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Dashboard básico</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Relatórios simples</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button className="w-full" variant="outline">
                      Começar Grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* PRO Plan */}
              {/*
              <Card className="relative flex flex-col border-2 border-brand shadow-brand-lg">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-brand px-4 py-1 text-white">Mais Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">R$ 29,90</span>
                    <span className="text-zinc-600 dark:text-zinc-400">/mês</span>
                  </div>
                  <CardDescription className="mt-4">
                    Para quem leva suas finanças a sério
                  </CardDescription>
                  <Badge className="mt-2 w-fit bg-green-100 text-green-700 hover:bg-green-100">
                    🎁 30 dias grátis
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Tudo do Básico +</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>3 workspaces</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Transações ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Metas e orçamentos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Dashboard personalizável</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Exportação de relatórios</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button className="btn-brand w-full">
                      Começar Trial Grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* BUSINESS Plan */}
              {/*
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Business</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">R$ 99,90</span>
                    <span className="text-zinc-600 dark:text-zinc-400">/mês</span>
                  </div>
                  <CardDescription className="mt-4">
                    Para empresas que precisam de controle total
                  </CardDescription>
                  <Badge className="mt-2 w-fit bg-green-100 text-green-700 hover:bg-green-100">
                    🎁 30 dias grátis
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Tudo do Pro +</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Workspaces ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Até 15 membros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Integração bancária</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>AI Assistant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button className="btn-brand w-full">
                      Começar Trial Grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="bg-brand-gradient-hero py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Pronto para transformar suas finanças?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Junte-se a milhares de pessoas que já organizaram sua vida financeira com FinkoMoney
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="h-14 bg-white px-10 text-lg font-semibold text-blue-600 shadow-brand-lg hover:bg-blue-50">
                  Começar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            {/* <p className="mt-6 text-blue-200">
              Sem cartão de crédito • Cancele quando quiser • Suporte em português
            </p> */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-brand">FinkoMoney</span>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Controle fácil, escolhas melhores.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Produto</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-brand">Features</Link>
                </li>
                {/* <li>
                  <Link href="#pricing" className="hover:text-brand">Preços</Link>
                </li> */}
                <li>
                  <Link href="#" className="hover:text-brand">Roadmap</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Empresa</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-brand">Sobre</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand">Blog</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand">Contato</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-brand">Privacidade</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand">Termos</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand">Segurança</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <p className="text-center text-sm text-zinc-500">
              © 2025 FinkoMoney. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
