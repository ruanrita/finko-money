-- Migration: Fix Features RLS Policies
-- This ensures that the features table has correct RLS policies in production

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Features are viewable by everyone" ON features;
DROP POLICY IF EXISTS "Plan features are viewable by everyone" ON plan_features;
DROP POLICY IF EXISTS "Only admins can insert features" ON features;
DROP POLICY IF EXISTS "Only admins can update features" ON features;
DROP POLICY IF EXISTS "Only admins can delete features" ON features;
DROP POLICY IF EXISTS "Only admins can insert plan features" ON plan_features;
DROP POLICY IF EXISTS "Only admins can delete plan features" ON plan_features;

-- Make sure RLS is enabled
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Recreate policies with correct permissions

-- Anyone can read features (needed for navigation)
CREATE POLICY "Features are viewable by everyone"
  ON features FOR SELECT
  USING (true);

-- Anyone can read plan_features (needed to check access)
CREATE POLICY "Plan features are viewable by everyone"
  ON plan_features FOR SELECT
  USING (true);

-- Only admins can modify features
CREATE POLICY "Only admins can insert features"
  ON features FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can update features"
  ON features FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete features"
  ON features FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Only admins can modify plan_features
CREATE POLICY "Only admins can insert plan features"
  ON plan_features FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete plan features"
  ON plan_features FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
