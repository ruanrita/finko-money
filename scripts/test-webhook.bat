@echo off
REM ============================================================
REM Script de Teste de Webhook Stripe - Windows
REM ============================================================

echo.
echo ============================================
echo  Teste de Webhook Stripe - FinkoMoney
echo ============================================
echo.

REM Verificar se Stripe CLI está instalado
where stripe >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Stripe CLI nao encontrado!
    echo.
    echo Instale com Scoop:
    echo   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
    echo   scoop install stripe
    echo.
    echo Ou baixe manualmente:
    echo   https://github.com/stripe/stripe-cli/releases/latest
    echo.
    pause
    exit /b 1
)

echo [OK] Stripe CLI encontrado
echo.

REM Verificar se o servidor está rodando
curl -s http://localhost:3000 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Servidor Next.js nao esta rodando!
    echo.
    echo Inicie o servidor em outro terminal:
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor Next.js rodando em localhost:3000
echo.

REM Instruções
echo ============================================
echo  IMPORTANTE - Leia antes de continuar
echo ============================================
echo.
echo 1. Copie o 'webhook signing secret' (whsec_...)
echo    que aparecera abaixo
echo.
echo 2. Adicione ao .env.local:
echo    STRIPE_WEBHOOK_SECRET=whsec_...
echo.
echo 3. Reinicie o servidor Next.js:
echo    - Pressione Ctrl+C no terminal do servidor
echo    - Execute: npm run dev
echo.
echo ============================================
echo  Como Testar
echo ============================================
echo.
echo 1. Acesse: http://localhost:3000/pricing
echo 2. Clique em 'Assinar' no Plano Pro
echo 3. Use o cartao de teste: 4242 4242 4242 4242
echo 4. Observe os webhooks neste terminal
echo.
echo ============================================
echo  Iniciando Listener...
echo ============================================
echo.

REM Iniciar listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

pause
