-- ========================================
-- Add review_count and review_score columns to products table
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ========================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_score DECIMAL(3,1);

-- Verify columns added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('review_count', 'review_score');
