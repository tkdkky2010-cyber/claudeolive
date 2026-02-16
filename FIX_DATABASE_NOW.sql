-- ========================================
-- CRITICAL FIX: Run this in Supabase SQL Editor NOW
-- ========================================
-- This fixes: Login failures, Cart failures, Email verification issues
-- URL: https://supabase.com/dashboard/project/_/sql

-- Step 1: Add missing supabase_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_id UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);

-- Step 2: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert into own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;
DROP POLICY IF EXISTS "Service role can insert crawl logs" ON crawl_logs;
DROP POLICY IF EXISTS "Service role can update crawl logs" ON crawl_logs;

-- Step 3: Create correct RLS policies for USERS table
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = supabase_id);

CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update users"
ON users FOR UPDATE
USING (true);

-- Step 4: Create correct RLS policies for CART_ITEMS table
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = cart_items.user_id
    AND users.supabase_id = auth.uid()
  )
);

CREATE POLICY "Users can insert into own cart"
ON cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = cart_items.user_id
    AND users.supabase_id = auth.uid()
  )
);

CREATE POLICY "Users can update own cart"
ON cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = cart_items.user_id
    AND users.supabase_id = auth.uid()
  )
);

CREATE POLICY "Users can delete from own cart"
ON cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = cart_items.user_id
    AND users.supabase_id = auth.uid()
  )
);

-- Step 5: Fix crawl_logs policies (for backend crawling)
CREATE POLICY "Service role can insert crawl logs"
ON crawl_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update crawl logs"
ON crawl_logs FOR UPDATE
USING (true);

-- Step 6: Clean up old user records without supabase_id (optional)
-- UNCOMMENT ONLY IF you want to delete old broken user accounts:
-- DELETE FROM users WHERE supabase_id IS NULL;

-- ========================================
-- DONE! Now restart your backend server
-- ========================================
