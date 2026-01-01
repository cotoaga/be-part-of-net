-- Auto-create consciousness_nodes when new users sign up
-- Solves the "empty network" bug where authenticated users don't see themselves

-- Drop existing trigger and function if they exist (for safe re-running)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_consciousness_node();

-- Create the trigger function
CREATE OR REPLACE FUNCTION create_consciousness_node()
RETURNS TRIGGER AS $$
DECLARE
  base_name TEXT;
  unique_name TEXT;
  name_exists BOOLEAN;
  attempt_count INT := 0;
BEGIN
  -- Generate base name from email (part before @)
  base_name := split_part(NEW.email, '@', 1);
  unique_name := base_name;

  -- Ensure node_name is unique by checking for conflicts
  -- If conflict exists, append a short random suffix
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM consciousness_nodes WHERE node_name = unique_name
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

  -- Insert consciousness node for the new user
  INSERT INTO consciousness_nodes (
    auth_user_id,
    node_name,
    node_email,
    node_type,
    temperature,
    status,
    is_admin
  ) VALUES (
    NEW.id,                    -- Link to auth.users.id
    unique_name,               -- Guaranteed unique name
    NEW.email,                 -- Full email
    'human',                   -- Default to human (AI nodes created separately)
    10.0,                      -- Hot temperature (just joined the network)
    'active',                  -- Active status
    FALSE                      -- Not admin by default (Kurt is set manually)
  )
  ON CONFLICT (auth_user_id) DO NOTHING;  -- Skip if already exists (shouldn't happen)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to fire on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_consciousness_node();

-- Verification queries (comment out after testing)
--
-- Check if trigger exists:
-- SELECT tgname, tgenabled, tgtype
-- FROM pg_trigger
-- WHERE tgname = 'on_auth_user_created';
--
-- Check if function exists:
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname = 'create_consciousness_node';
