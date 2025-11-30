-- Fix category unique constraint to allow same names across different branches
-- The old constraint (user_id, name) prevented users from having categories
-- with the same name in different branches/workspaces.

-- Drop the old constraint
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_name_key;

-- Add new constraint: categories must be unique per user+branch+name
-- This allows the same category names in different workspaces
ALTER TABLE categories
  ADD CONSTRAINT categories_user_branch_name_key
  UNIQUE (user_id, branch_id, name);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT categories_user_branch_name_key ON categories IS
  'Ensures category names are unique within each workspace (branch) for a user, but allows the same name across different workspaces';
