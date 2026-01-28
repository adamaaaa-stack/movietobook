import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_URL } from '@/lib/payfast';

export const dynamic = 'force-dynamic';

// Generate PayFast signature
function generatePayFastSignature(data: Record<string, string>): string {
  // Remove empty values and signature
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && key !== 'signature') {
      filtered[key] = value;
    }
  }

  // Sort alphabetically
  const sorted = Object.keys(filtered).sort();

  // Create query string
  const queryString = sorted
    .map(key => `${key}=${encodeURIComponent(filtered[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if set
  const stringToSign = PAYFAST_PASSPHRASE 
    ? `${queryString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : queryString;

  // Generate MD5 hash
  return crypto.createHash('md5').update(stringToSign).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      console.error('Missing PayFast configuration:', {
        hasMerchantId: !!PAYFAST_MERCHANT_ID,
        hasMerchantKey: !!PAYFAST_MERCHANT_KEY,
      });
      return NextResponse.json(
        { error: 'PayFast not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();

    // PayFast subscription parameters
    const amount = '10.00'; // $10/month
    const itemName = 'Movie2Book Pro - Monthly Subscription';
    const subscriptionType = '1'; // 1 = subscription
    const billingDate = new Date();
    billingDate.setMonth(billingDate.getMonth() + 1);
    const recurringAmount = '10.00';
    const frequency = '3'; // 3 = monthly
    const cycles = '0'; // 0 = indefinite

    const payfastData: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      notify_url: `${request.nextUrl.origin}/api/webhook/payfast`,
      name_first: userData?.user_metadata?.full_name?.split(' ')[0] || '',
      name_last: userData?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      email_address: userData?.email || '',
      cell_number: '',
      m_payment_id: user.id, // User ID for tracking
      amount: amount,
      item_name: itemName,
      subscription_type: subscriptionType,
      billing_date: billingDate.toISOString().split('T')[0],
      recurring_amount: recurringAmount,
      frequency: frequency,
      cycles: cycles,
    };

    // Generate signature
    const signature = generatePayFastSignature(payfastData);
    payfastData.signature = signature;

    // Return PayFast form data (frontend will submit to PayFast)
    return NextResponse.json({ 
      url: PAYFAST_URL,
      data: payfastData,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
