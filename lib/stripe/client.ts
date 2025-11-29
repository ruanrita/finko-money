import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está configurada nas variáveis de ambiente');
}

// Cliente Stripe para uso no backend (server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'FinkoMoney',
    version: '1.0.0',
  },
});
