-- Update user_subscriptions table for Lemon Squeezy integration
-- Run this migration to replace Stripe fields with Lemon Squeezy fields

-- Drop old Stripe columns if they exist
ALTER TABLE user_subscriptions 
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id;

-- Add Lemon Squeezy columns
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_ls_customer 
  ON user_subscriptions(lemon_squeezy_customer_id);

-- If table doesn't exist yet, create it
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'cancelled')),
  free_conversions_used BOOLEAN NOT NULL DEFAULT false,
  lemon_squeezy_customer_id TEXT,
  lemon_squeezy_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_ls_customer ON user_subscriptions(lemon_squeezy_customer_id);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
