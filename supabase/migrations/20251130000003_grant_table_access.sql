-- Migration: Grant table access to roles
-- RLS policies alone are not enough - we need to grant table-level permissions

-- Grant SELECT on all necessary tables to authenticated and anon roles
GRANT SELECT ON public.features TO authenticated, anon;
GRANT SELECT ON public.plan_features TO authenticated, anon;
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT SELECT ON public.system_config TO authenticated;

-- Grant SELECT on verification_codes only to authenticated users
GRANT SELECT ON public.verification_codes TO authenticated;

-- Grant SELECT on email_logs to authenticated users
GRANT SELECT ON public.email_logs TO authenticated;

-- Service role already has full access, but let's be explicit
GRANT ALL ON public.features TO service_role;
GRANT ALL ON public.plan_features TO service_role;
GRANT ALL ON public.subscription_plans TO service_role;
GRANT ALL ON public.verification_codes TO service_role;
GRANT ALL ON public.email_logs TO service_role;
GRANT ALL ON public.system_config TO service_role;
