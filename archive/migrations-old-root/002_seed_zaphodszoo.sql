-- Migration: Seed Zaphod's Zoo Demo Graph
-- Creates 12 demo nodes and 18 demo edges for anonymous user exploration

-- ============================================
-- DEMO NODES (12 total)
-- ============================================

-- Person nodes (5)
INSERT INTO nodes (id, type, name, description, email, confirmed, is_demo, controlled_by)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'person',
    'Zaphod Beeblebrox',
    'Ex-President of the Galaxy. Two heads, three arms, and zero impulse control. Currently on the run.',
    'zaphod@heartofgold.galaxy',
    TRUE,
    TRUE,
    '{}'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'person',
    'Arthur Dent',
    'Last surviving human from Earth. Still looking for a decent cup of tea in the universe.',
    'arthur@earthling.sol',
    TRUE,
    TRUE,
    '{}'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'person',
    'Ford Prefect',
    'Roving researcher for the Hitchhiker''s Guide. From Betelgeuse, not Guildford.',
    'ford@guide.galaxy',
    TRUE,
    TRUE,
    '{}'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'person',
    'Trillian',
    'Astrophysicist. Left Earth before its demolition. Makes better life choices than Zaphod.',
    'trillian@science.galaxy',
    TRUE,
    TRUE,
    '{}'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'person',
    'Marvin',
    'Prototype paranoid android with Genuine People Personalities™. Brain the size of a planet.',
    'marvin@depressed.bot',
    TRUE,
    TRUE,
    '{}'
  );

-- App nodes (3)
INSERT INTO nodes (id, type, name, description, url, is_demo, controlled_by)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'app',
    'Heart of Gold',
    'Stolen starship powered by the Infinite Improbability Drive. Features: improbable escapes.',
    'https://heartofgold.galaxy',
    TRUE,
    '{}'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'app',
    'Infinite Improbability Drive',
    'Propulsion system that passes through every point in the universe simultaneously. Side effects vary.',
    'https://improbability.tech',
    TRUE,
    '{}'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'app',
    'Babel Fish',
    'Universal translator. Small, yellow, leech-like. Insert in ear for instant comprehension.',
    'https://babelfish.translate',
    TRUE,
    '{}'
  );

-- MCP nodes (4)
INSERT INTO nodes (id, type, name, description, endpoint_url, is_demo, controlled_by)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'mcp',
    'Deep Thought',
    'Supercomputer designed to calculate the Answer to Life, the Universe, and Everything. Spoiler: 42.',
    'mcp://deepthought.magrathea:7777',
    TRUE,
    '{}'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'mcp',
    'Guide MCP',
    'AI assistant for the Hitchhiker''s Guide to the Galaxy. Mostly harmless. Don''t Panic.',
    'mcp://guide.galaxy:4242',
    TRUE,
    '{}'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'mcp',
    'Eddie',
    'Ship''s computer aboard the Heart of Gold. Perpetually cheerful. Annoyingly so.',
    'mcp://eddie.heartofgold:8080',
    TRUE,
    '{}'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'mcp',
    'Milliways',
    'Restaurant at the End of the Universe reservation system. Book your table at time''s end.',
    'mcp://milliways.universe:9999',
    TRUE,
    '{}'
  );

-- ============================================
-- DEMO EDGES (18 total)
-- ============================================

-- Zaphod's connections (5 outbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'rescued-from-earth', NULL, TRUE),
  ('a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'semi-cousin', NULL, TRUE),
  ('a1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'ex-girlfriend', NULL, TRUE),
  ('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'stole-this-ship', NULL, TRUE),
  ('a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'annoys-me', NULL, TRUE);

-- Arthur's connections (4 outbound, 1 already inbound from Zaphod)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('a2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'saved-my-life', NULL, TRUE),
  ('a2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'traveling-companion', NULL, TRUE),
  ('a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'uses-daily', NULL, TRUE),
  ('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'consults-frequently', NULL, TRUE);

-- Ford's connections (3 outbound, 2 already inbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('a3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'field-researcher-for', NULL, TRUE),
  ('a3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'once-met', NULL, TRUE),
  ('a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'essential-tool', NULL, TRUE);

-- Trillian's connections (2 outbound, 2 already inbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('a4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'studies', NULL, TRUE),
  ('a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'works-on', NULL, TRUE);

-- Marvin's connections (2 outbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('a5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'reluctantly-serves-on', NULL, TRUE),
  ('a5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'intellectually-incompatible-with', NULL, TRUE);

-- Heart of Gold connections (1 outbound, 3 already inbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'powered-by', NULL, TRUE);

-- Guide MCP connections (1 outbound, 2 already inbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('c2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'references', NULL, TRUE);

-- Milliways connections (2 outbound)
INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
VALUES
  ('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'regular-customer', NULL, TRUE),
  ('c4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'temporal-reservation-system', NULL, TRUE);

-- ============================================
-- VERIFICATION
-- ============================================

-- Count demo nodes by type
SELECT
  type,
  COUNT(*) as count
FROM nodes
WHERE is_demo = TRUE
GROUP BY type
ORDER BY type;

-- Expected output:
-- type    | count
-- --------+-------
-- app     |     3
-- mcp     |     4
-- person  |     5

-- Count demo edges
SELECT COUNT(*) as edge_count
FROM edges
WHERE is_demo = TRUE;

-- Expected output: 18

-- Verify no self-loops
SELECT COUNT(*) as self_loops
FROM edges
WHERE from_node_id = to_node_id AND is_demo = TRUE;

-- Expected output: 0

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE nodes IS 'Demo graph contains characters, apps, and MCPs from Hitchhiker''s Guide to the Galaxy';
COMMENT ON TABLE edges IS 'Demo edges show various relationship types with privacy-preserving labels';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Zaphod''s Zoo demo graph created successfully!';
  RAISE NOTICE '   - 12 nodes (5 people, 3 apps, 4 MCPs)';
  RAISE NOTICE '   - 18 edges with diverse topology';
  RAISE NOTICE '   - All nodes marked with is_demo=TRUE';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test anonymous access to demo graph';
  RAISE NOTICE '2. Verify fog-of-war mechanics from different center nodes';
  RAISE NOTICE '3. Build UI for graph exploration';
END $$;
