-- Drop all tables in public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Cleanup supabase migrations table
DELETE FROM supabase_migrations.schema_migrations;
