-- 001: Add email authentication support to users table
-- This migration adds email login support alongside Google OAuth

BEGIN TRANSACTION;

-- 1. Create new users table with additional columns
CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  auth_method TEXT NOT NULL DEFAULT 'google' CHECK(auth_method IN ('google', 'email')),
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  email_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Copy existing data from old users table (Google OAuth users)
INSERT INTO users_new (id, google_id, email, name, avatar_url, auth_method, role, email_verified, created_at)
SELECT id, google_id, email, name, avatar_url, 'google', 'user', 1, created_at
FROM users;

-- 3. Drop old users table
DROP TABLE users;

-- 4. Rename new table to users
ALTER TABLE users_new RENAME TO users;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMIT;
