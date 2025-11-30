-- Migration: Fix ALL RLS Policies
-- This ensures all tables have correct RLS policies for the app to work

-- =====================================================
-- 1. FEATURES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Features are viewable by everyone" ON features;
DROP POLICY IF EXISTS "Only admins can insert features" ON features;
DROP POLICY IF EXISTS "Only admins can update features" ON features;
DROP POLICY IF EXISTS "Only admins can delete features" ON features;

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read features (needed for navigation)
CREATE POLICY "Features are viewable by everyone"
  ON features FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify features"
  ON features FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- =====================================================
-- 2. PLAN_FEATURES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Plan features are viewable by everyone" ON plan_features;
DROP POLICY IF EXISTS "Only admins can insert plan features" ON plan_features;
DROP POLICY IF EXISTS "Only admins can delete plan features" ON plan_features;

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Plan features are viewable by everyone"
  ON plan_features FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify plan features"
  ON plan_features FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- =====================================================
-- 3. SUBSCRIPTION_PLANS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Subscription plans are viewable by everyone" ON subscription_plans;
DROP POLICY IF EXISTS "Only admins can modify subscription plans" ON subscription_plans;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Subscription plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- =====================================================
-- 4. VERIFICATION_CODES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Service role can manage verification codes" ON verification_codes;

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own codes
CREATE POLICY "Users can view their own verification codes"
  ON verification_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can do everything (bypasses RLS anyway, but explicit policy helps)
CREATE POLICY "Service role can manage verification codes"
  ON verification_codes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. EMAIL_LOGS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own email logs" ON email_logs;
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can update email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can manage email logs" ON email_logs;

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can manage email logs"
  ON email_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. SYSTEM_CONFIG TABLE (if exists)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "System config viewable by authenticated" ON system_config;
    DROP POLICY IF EXISTS "Only admins can modify system config" ON system_config;

    ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

    -- Allow authenticated users to read
    CREATE POLICY "System config viewable by authenticated"
      ON system_config FOR SELECT
      TO authenticated
      USING (true);

    -- Only admins can modify
    CREATE POLICY "Only admins can modify system config"
      ON system_config FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
  END IF;
END $$;
