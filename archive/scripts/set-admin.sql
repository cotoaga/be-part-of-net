-- Set admin status for kurt@cotoaga.net

-- First, ensure a users table entry exists
INSERT INTO users (auth_user_id, email, is_admin)
SELECT
  au.id,
  au.email,
  true
FROM auth.users au
WHERE au.email = 'kurt@cotoaga.net'
ON CONFLICT (auth_user_id)
DO UPDATE SET is_admin = true;

-- Verify the change
SELECT
  u.id,
  u.auth_user_id,
  u.email,
  u.is_admin
FROM users u
JOIN auth.users au ON u.auth_user_id = au.id
WHERE au.email = 'kurt@cotoaga.net';
