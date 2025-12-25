-- ROLLBACK SCRIPT: Revert from new schema to legacy consciousness schema
-- ⚠️ WARNING: This drops the new tables and restores the old schema
-- Only use this if the migration fails catastrophically
--
-- To execute this rollback:
-- 1. Stop your application
-- 2. Run this SQL via Supabase dashboard or CLI
-- 3. Revert application code changes
-- 4. Restart application

-- ============================================
-- STEP 1: Drop new schema tables
-- ============================================

DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- STEP 2: Drop new functions
-- ============================================

DROP FUNCTION IF EXISTS get_user_nodes(UUID);
DROP FUNCTION IF EXISTS get_hop_distance(UUID);

-- ============================================
-- STEP 3: Restore legacy trigger (if needed)
-- ============================================

-- Drop new trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_and_node();

-- Recreate legacy trigger
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
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM consciousness_nodes WHERE node_name = unique_name
    ) INTO name_exists;

    EXIT WHEN NOT name_exists;

    -- Generate unique suffix
    unique_name := base_name || '-' || substr(md5(random()::text), 1, 4);

    attempt_count := attempt_count + 1;
    IF attempt_count > 10 THEN
      unique_name := base_name || '-' || substr(NEW.id::text, 1, 8);
      EXIT;
    END IF;
  END LOOP;

  -- Insert consciousness node
  INSERT INTO consciousness_nodes (
    auth_user_id,
    node_name,
    node_email,
    node_type,
    temperature,
    status,
    is_admin
  ) VALUES (
    NEW.id,
    unique_name,
    NEW.email,
    'human',
    10.0,
    'active',
    FALSE
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_consciousness_node();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ROLLBACK COMPLETE';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'New schema tables dropped';
  RAISE NOTICE 'Legacy trigger restored';
  RAISE NOTICE 'IMPORTANT: Revert application code changes!';
  RAISE NOTICE '==============================================';
END $$;
