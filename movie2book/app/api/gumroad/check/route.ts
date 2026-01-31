import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/gumroad/check — diagnostic (no secrets in response).
 * Open this URL in the browser to see if Gumroad + Supabase are configured.
 */
export async function GET() {
  const checks: Record<string, string> = {};
  checks.gumroad_product_id = process.env.GUMROAD_PRODUCT_ID || process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID ? 'set' : 'missing';
  checks.nextauth_secret = process.env.NEXTAUTH_SECRET ? 'set' : 'missing';
  checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing';
  checks.supabase_service_role = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing';

  if (checks.supabase_url === 'set' && checks.supabase_service_role === 'set') {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('user_subscriptions')
        .select('id')
        .limit(1);
      checks.user_subscriptions = error ? `error: ${error.message}` : 'ok';
    } catch (e) {
      checks.user_subscriptions = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    checks.user_subscriptions = 'skip (Supabase not configured)';
  }

  const allOk = checks.gumroad_product_id === 'set'
    && checks.nextauth_secret === 'set'
    && checks.supabase_url === 'set'
    && checks.supabase_service_role === 'set'
    && checks.user_subscriptions === 'ok';

  return NextResponse.json({
    ok: allOk,
    message: allOk ? 'Gumroad + Supabase configured. Try verifying a license on /subscribe.' : 'Something is missing or broken. Fix the items above.',
    checks,
  });
}
