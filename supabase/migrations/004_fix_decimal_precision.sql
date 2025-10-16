-- Fix numeric overflow: coherence_level needs to support 100.0
-- DECIMAL(3,1) only allows up to 99.9, but we need 100.0

ALTER TABLE consciousness_nodes
  ALTER COLUMN coherence_level TYPE DECIMAL(5,1);

ALTER TABLE consciousness_nodes
  ALTER COLUMN temperature TYPE DECIMAL(4,1);

-- Verify the changes
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'consciousness_nodes'
  AND column_name IN ('temperature', 'coherence_level');
