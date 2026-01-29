-- Migration: Add PayPal subscription support to user_subscriptions
-- Run this in Supabase SQL Editor after the base user_subscriptions table exists.

-- Add PayPal column
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_paypal_subscription_id
ON user_subscriptions(paypal_subscription_id);

-- Ensure service role can manage all (for webhooks)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;

CREATE POLICY "Service role can manage all subscriptions"
ON user_subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow INSERT for webhook: service role is used by API route with SUPABASE_SERVICE_ROLE_KEY
-- No additional policy needed if service_role policy above uses FOR ALL.
