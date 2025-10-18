-- Add admin support to consciousness_nodes
-- Phase 1: Architecture Realignment

-- Add is_admin column
ALTER TABLE consciousness_nodes
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make Kurt the god (update this with the actual email)
UPDATE consciousness_nodes
SET is_admin = TRUE
WHERE node_email = 'kurt@cotoaga.net';

-- Create index for performance (partial index - only indexes admin rows)
CREATE INDEX IF NOT EXISTS idx_nodes_is_admin
ON consciousness_nodes(is_admin)
WHERE is_admin = TRUE;

-- Verification query (comment out after running)
-- SELECT node_name, node_email, is_admin
-- FROM consciousness_nodes
-- WHERE is_admin = TRUE;
