-- Add book credits (one-time purchases) to user_subscriptions
-- Run in Supabase SQL Editor after user_subscriptions exists.

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS books_remaining INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_subscriptions.books_remaining IS 'Credits from one-time purchases; decremented on each conversion.';
