-- Run this ONCE in Supabase Dashboard → SQL Editor → New query
-- Adds books_remaining so Gumroad credits work. Safe to run if column already exists.

-- If user_subscriptions doesn't exist yet, create it with books_remaining
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'cancelled')),
  free_conversions_used BOOLEAN NOT NULL DEFAULT false,
  books_remaining INT NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If table already existed without books_remaining, add the column
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS books_remaining INT NOT NULL DEFAULT 0;

-- Index and policy (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL USING (auth.role() = 'service_role');
