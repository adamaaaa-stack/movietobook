import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Lemon Squeezy customer ID
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('lemon_squeezy_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subData?.lemon_squeezy_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Lemon Squeezy customer portal URL
    // Format: https://app.lemonsqueezy.com/my-account/subscriptions?customer={customer_id}
    const portalUrl = `https://app.lemonsqueezy.com/my-account/subscriptions?customer=${subData.lemon_squeezy_customer_id}`;

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
