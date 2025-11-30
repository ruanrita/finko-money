#!/bin/bash

# Script to apply migration to production database

# Read database URL from .env.local
export $(grep -v '^#' .env.local | grep SUPABASE_DB_URL | xargs)

echo "Applying migration to production database..."
echo "Database URL: ${SUPABASE_DB_URL}"

# Apply migration
psql "${SUPABASE_DB_URL}" -f supabase/migrations/20251130000001_fix_features_rls.sql

echo "Migration applied successfully!"
