#!/bin/bash

# ============================================================
# Script de Teste de Webhook Stripe
# ============================================================
# Facilita o teste do fluxo completo de webhooks
# ============================================================

echo "🔔 Teste de Webhook Stripe - FinkoMoney"
echo "========================================"
echo ""

# Verificar se Stripe CLI está instalado
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI não encontrado!"
    echo ""
    echo "Instale com:"
    echo "  Windows: scoop install stripe"
    echo "  macOS:   brew install stripe/stripe-cli/stripe"
    echo "  Linux:   https://stripe.com/docs/stripe-cli#install"
    exit 1
fi

echo "✅ Stripe CLI encontrado"
echo ""

# Verificar se está logado
if ! stripe config --list &> /dev/null; then
    echo "⚠️  Você precisa fazer login no Stripe CLI"
    echo ""
    stripe login
fi

echo "✅ Autenticado no Stripe"
echo ""

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Servidor Next.js não está rodando!"
    echo ""
    echo "Inicie o servidor em outro terminal:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ Servidor Next.js rodando em localhost:3000"
echo ""

# Iniciar listener
echo "🎧 Iniciando Stripe webhook listener..."
echo ""
echo "📝 IMPORTANTE:"
echo "   1. Copie o 'webhook signing secret' (whsec_...)"
echo "   2. Adicione ao .env.local:"
echo "      STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   3. Reinicie o servidor (npm run dev)"
echo ""
echo "🧪 Para testar:"
echo "   1. Acesse: http://localhost:3000/pricing"
echo "   2. Clique em 'Assinar' no Plano Pro"
echo "   3. Use o cartão: 4242 4242 4242 4242"
echo "   4. Observe os webhooks abaixo"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe
