-- Add book credits (10 books for $10 purchase) to user_subscriptions
-- Run in Supabase SQL Editor after user_subscriptions exists.

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS books_remaining INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_subscriptions.books_remaining IS 'Credits from 10-books purchase; decremented on each conversion.';
