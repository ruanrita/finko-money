-- Create branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branch_members table
CREATE TABLE branch_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES public.users(id),
  UNIQUE(branch_id, user_id)
);

-- Add branch_id to existing tables
ALTER TABLE categories ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_branch_members_user_id ON branch_members(user_id);
CREATE INDEX idx_branch_members_branch_id ON branch_members(branch_id);
CREATE INDEX idx_categories_branch_id ON categories(branch_id);
CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);

CREATE OR REPLACE FUNCTION create_branch_with_owner(
  p_name TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_branch_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();

  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a branch';
  END IF;

  -- Insert branch
  INSERT INTO public.branches (name, description)
  VALUES (p_name, p_description)
  RETURNING branches.id INTO v_branch_id;

  -- Insert owner membership
  INSERT INTO public.branch_members (branch_id, user_id, role)
  VALUES (v_branch_id, v_user_id, 'owner');

  -- Return the created branch
  RETURN QUERY
  SELECT b.id, b.name, b.description, b.created_at, b.updated_at
  FROM public.branches b
  WHERE b.id = v_branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_branch_with_owner(TEXT, TEXT) TO authenticated;
