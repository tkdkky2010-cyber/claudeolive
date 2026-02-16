-- Migration: Add supabase_id column to users table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add supabase_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_id UUID UNIQUE;

-- Create index for supabase_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);

-- Update RLS policies to use supabase_id
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = supabase_id);

-- Allow service role to insert users (for signup)
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

-- Allow service role to update users
DROP POLICY IF EXISTS "Service role can update users" ON users;
CREATE POLICY "Service role can update users"
ON users FOR UPDATE
USING (true);
