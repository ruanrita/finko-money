'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);
  const [priceIds, setPriceIds] = useState<any>({});
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Buscar price IDs e plano atual
  useEffect(() => {
    async function loadData() {
      try {
        // Carregar prices
        const pricesRes = await fetch('/api/subscription/prices');
        const pricesData = await pricesRes.json();

        if (pricesData.prices) {
          setPriceIds(pricesData.prices);
        }

        // Carregar plano atual do usuário
        const planRes = await fetch('/api/user/current-plan');
        const planData = await planRes.json();

        setIsAuthenticated(planData.authenticated);
        if (planData.plan) {
          setCurrentPlan(planData.plan);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: { month: 0, year: 0 },
      priceId: { month: null, year: null },
      description: 'Para começar a organizar suas finanças',
      features: [
        '50 transações/mês',
        '5 categorias customizadas',
        '3 metas financeiras',
        '3 orçamentos',
        '2 membros na equipe',
        '2 branches próprias',
        '3 lembretes via email',
        'Exportação CSV',
        'Suporte via email',
      ],
    },
    {
      name: 'Pro',
      price: { month: 15.90, year: 159 },
      // Price IDs são carregados dinamicamente do banco de dados
      priceId: {
        month: priceIds.pro?.prices?.month?.stripePriceId || null,
        year: priceIds.pro?.prices?.year?.stripePriceId || null,
      },
      description: 'Para controle total das suas finanças',
      features: [
        '300 transações/mês',
        '20 categorias customizadas',
        '15 metas financeiras',
        '10 orçamentos',
        '10 membros na equipe',
        '5 branches próprias',
        '15 lembretes via email',
        'Relatórios avançados',
        'Exportação CSV/PDF/Excel',
        'Suporte prioritário',
      ],
      popular: true,
    },
  ];

  // Verificar se é o plano atual do usuário
  const isCurrentPlan = (planName: string) => {
    if (!currentPlan) return false;

    // Normalizar nomes de planos
    const normalizedCurrent = currentPlan.name.toLowerCase();
    const normalizedPlan = planName.toLowerCase();

    // Early adopters estão no plano "initial_launch" mas veem como se fosse Pro
    if (normalizedCurrent === 'initial_launch' && normalizedPlan === 'pro') {
      return currentPlan.isEarlyAdopter;
    }

    return normalizedCurrent === normalizedPlan;
  };

  async function handleSubscribe(priceId: string | null, planName: string) {
    // Verificar se já está no plano
    if (isCurrentPlan(planName)) {
      if (planName === 'Free') {
        toast.info('Você já está no plano Free!');
      } else {
        toast.info('Este já é o seu plano atual!');
      }
      return;
    }

    if (!priceId) {
      toast.info('Você já está no plano Free!');
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      window.location.href = url;
    } catch (error) {
      toast.error('Erro ao iniciar checkout');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
        <p className="text-lg text-muted-foreground">
          Comece grátis. Faça upgrade quando precisar.
        </p>
      </div>

      {/* Toggle Month/Year */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border p-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-4 py-2 rounded ${
              interval === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-4 py-2 rounded ${
              interval === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Anual
            <Badge variant="secondary" className="ml-2">
              Economize 2 meses
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.name);

          return (
            <Card
              key={plan.name}
              className={`relative ${
                isCurrent
                  ? 'border-green-500 shadow-lg ring-2 ring-green-500/20'
                  : plan.popular
                  ? 'border-primary shadow-lg'
                  : ''
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1 bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Plano Atual
                  </Badge>
                </div>
              )}

              {!isCurrent && plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">
                  {plan.name}
                  {currentPlan?.isEarlyAdopter &&
                    plan.name === 'Pro' &&
                    isCurrent && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Early Adopter
                      </Badge>
                    )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    R$ {plan.price[interval].toFixed(2)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{interval === 'month' ? 'mês' : 'ano'}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() =>
                    handleSubscribe(plan.priceId[interval], plan.name)
                  }
                  className="w-full"
                  variant={
                    isCurrent ? 'secondary' : plan.popular ? 'default' : 'outline'
                  }
                  disabled={loading === plan.name || isCurrent}
                >
                  {loading === plan.name
                    ? 'Carregando...'
                    : isCurrent
                    ? 'Plano Atual'
                    : plan.name === 'Free'
                    ? 'Downgrade para Free'
                    : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>
          7 dias de teste grátis no plano Pro. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
