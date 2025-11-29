'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);

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
      priceId: {
        month: 'price_pro_monthly', // ⚠️ Substituir pelo ID real do Stripe
        year: 'price_pro_yearly',   // ⚠️ Substituir pelo ID real do Stripe
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

  async function handleSubscribe(priceId: string | null, planName: string) {
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
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
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
                onClick={() => handleSubscribe(plan.priceId[interval], plan.name)}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                disabled={loading === plan.name}
              >
                {loading === plan.name
                  ? 'Carregando...'
                  : plan.name === 'Free'
                  ? 'Plano Atual'
                  : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>
          7 dias de teste grátis no plano Pro. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
