-- Migration: Switch to PayFast
-- Run this in Supabase SQL Editor

-- Drop Stripe columns if they exist
ALTER TABLE user_subscriptions 
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_subscription_id;

-- Add PayFast columns
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS payfast_token TEXT,
ADD COLUMN IF NOT EXISTS payfast_subscription_id TEXT;

-- Create index on payfast_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payfast_token 
ON user_subscriptions(payfast_token);

-- Ensure the table structure is correct
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_subscriptions') THEN
    CREATE TABLE user_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'cancelled')),
      free_conversions_used BOOLEAN NOT NULL DEFAULT false,
      payfast_token TEXT,
      payfast_subscription_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id)
    );
  END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;

-- Create RLS policies
CREATE POLICY "Users can view their own subscription"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
ON user_subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
