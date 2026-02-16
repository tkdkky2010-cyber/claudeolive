-- PostgreSQL Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT '전체',
  product_name TEXT NOT NULL,
  original_price INTEGER,
  sale_price INTEGER NOT NULL,
  discount_rate INTEGER DEFAULT 0,
  oliveyoung_url TEXT NOT NULL,
  image_url TEXT,
  crawled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ranking_date DATE NOT NULL,
  UNIQUE(ranking_date, category, rank)
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_ranking_date ON products(ranking_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_rank ON products(rank);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  supabase_id UUID UNIQUE, -- Linked to auth.users in Supabase
  google_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  auth_method TEXT DEFAULT 'google' CHECK(auth_method IN ('google', 'email')),
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Shopping Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Index for cart
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);

-- Crawl Logs Table
CREATE TABLE IF NOT EXISTS crawl_logs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK(status IN ('running', 'success', 'error')),
  products_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Index for crawl logs
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at DESC);

-- Login Attempts Table (for security)
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  successful BOOLEAN DEFAULT FALSE
);

-- Indexes for login attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);

-- Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ
);

-- Indexes for email verification
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- RLS Policies for users (users can view their own data)
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = supabase_id);

-- Allow backend (service role) to insert/update users during signup/login
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update users"
ON users FOR UPDATE
USING (true);

-- RLS Policies for cart_items (users can only access their own cart)
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = cart_items.user_id AND users.supabase_id = auth.uid()
));

CREATE POLICY "Users can insert into own cart"
ON cart_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM users WHERE users.id = cart_items.user_id AND users.supabase_id = auth.uid()
));

CREATE POLICY "Users can update own cart"
ON cart_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = cart_items.user_id AND users.supabase_id = auth.uid()
));

CREATE POLICY "Users can delete from own cart"
ON cart_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = cart_items.user_id AND users.supabase_id = auth.uid()
));

-- Allow backend to manage crawl logs
CREATE POLICY "Service role can insert crawl logs"
ON crawl_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update crawl logs"
ON crawl_logs FOR UPDATE
USING (true);

-- Service role can do everything (for backend operations)
-- Note: These policies will be bypassed when using service_role key
