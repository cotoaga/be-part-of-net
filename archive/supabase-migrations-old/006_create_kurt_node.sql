-- Create Kurt's consciousness node
-- This needs to happen first so the admin exists in the network

-- Add unique constraint on auth_user_id (each auth user should only have one consciousness node)
ALTER TABLE consciousness_nodes
ADD CONSTRAINT consciousness_nodes_auth_user_id_key UNIQUE (auth_user_id);

-- Create Kurt's node if it doesn't exist
-- This will link to whichever auth.users record has kurt@cotoaga.net
INSERT INTO consciousness_nodes (
  auth_user_id,
  node_name,
  node_aka,
  node_email,
  node_type,
  node_url,
  temperature,
  status,
  is_admin
)
SELECT
  u.id,                      -- Get Kurt's actual auth UUID
  'Kurt Cotoaga',            -- Full name
  'Kydroon',                 -- Alias
  'kurt@cotoaga.net',        -- Email
  'human',                   -- Type
  'https://cotoaga.ai',      -- Website
  10.0,                      -- Hot (just manifested)
  'active',                  -- Status
  TRUE                       -- God mode enabled
FROM auth.users u
WHERE u.email = 'kurt@cotoaga.net'
ON CONFLICT (auth_user_id) DO UPDATE SET
  is_admin = TRUE,           -- Ensure admin flag is set
  node_url = EXCLUDED.node_url,
  node_aka = EXCLUDED.node_aka;

-- Verification (comment out after confirming)
-- SELECT
--   cn.node_name,
--   cn.node_email,
--   cn.is_admin,
--   cn.temperature,
--   cn.auth_user_id
-- FROM consciousness_nodes cn
-- WHERE cn.node_email = 'kurt@cotoaga.net';
