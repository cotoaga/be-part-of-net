-- Update auto-create trigger to use NEW schema (users + nodes)
-- Replaces the legacy trigger that created consciousness_nodes

-- Drop existing legacy trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_consciousness_node();

-- Create the NEW trigger function for users + nodes schema
CREATE OR REPLACE FUNCTION create_user_and_node()
RETURNS TRIGGER AS $$
DECLARE
  base_name TEXT;
  unique_name TEXT;
  name_exists BOOLEAN;
  attempt_count INT := 0;
  new_user_id UUID;
BEGIN
  -- Generate base name from email (part before @)
  base_name := split_part(NEW.email, '@', 1);
  unique_name := base_name;

  -- Ensure node name is unique by checking for conflicts
  -- If conflict exists, append a short random suffix
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM nodes WHERE name = unique_name AND is_demo = FALSE
    ) INTO name_exists;

    EXIT WHEN NOT name_exists;

    -- Generate unique suffix: base_name-XXXX (4 random hex chars)
    unique_name := base_name || '-' || substr(md5(random()::text), 1, 4);

    -- Safety: prevent infinite loop (should never happen)
    attempt_count := attempt_count + 1;
    IF attempt_count > 10 THEN
      -- Fall back to UUID-based name
      unique_name := base_name || '-' || substr(NEW.id::text, 1, 8);
      EXIT;
    END IF;
  END LOOP;

  -- STEP 1: Insert into users table
  INSERT INTO users (
    auth_user_id,
    email,
    is_admin,
    temperature,
    last_login,
    created_at
  ) VALUES (
    NEW.id,                    -- Link to auth.users.id
    NEW.email,                 -- Full email
    FALSE,                     -- Not admin by default
    10.0,                      -- Hot temperature (just joined)
    NOW(),                     -- Last login = now
    NOW()                      -- Created at
  )
  ON CONFLICT (auth_user_id) DO NOTHING
  RETURNING id INTO new_user_id;

  -- STEP 2: Insert into nodes table (person type)
  INSERT INTO nodes (
    type,
    name,
    description,
    email,
    confirmed,
    controlled_by,
    is_demo,
    created_at
  ) VALUES (
    'person',                  -- Node type = person (not 'human')
    unique_name,               -- Guaranteed unique name
    NULL,                      -- No description yet
    NEW.email,                 -- Email address
    TRUE,                      -- Confirmed (they just signed up)
    ARRAY[NEW.id]::UUID[],     -- Controlled by this user
    FALSE,                     -- Not demo data
    NOW()                      -- Created at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to fire on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_and_node();

-- Add comment
COMMENT ON FUNCTION create_user_and_node IS 'Auto-create user and person node when new user signs up via Supabase Auth';
