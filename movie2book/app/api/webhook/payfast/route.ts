import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_ITN_URL } from '@/lib/payfast';

export const dynamic = 'force-dynamic';

// Verify PayFast ITN (Instant Transaction Notification)
async function verifyPayFastITN(data: Record<string, string>): Promise<boolean> {
  try {
    // Create parameter string for validation
    const paramString = Object.keys(data)
      .filter(key => key !== 'signature')
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');

    const stringToSign = PAYFAST_PASSPHRASE
      ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
      : paramString;

    const calculatedSignature = crypto.createHash('md5').update(stringToSign).digest('hex');

    // Verify signature matches
    if (calculatedSignature !== data.signature) {
      console.error('PayFast signature mismatch');
      return false;
    }

    // Validate with PayFast
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(PAYFAST_ITN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    return responseText === 'VALID';
  } catch (error) {
    console.error('PayFast ITN verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};

    // Convert FormData to object
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Verify ITN
    const isValid = await verifyPayFastITN(data);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid ITN' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const userId = data.m_payment_id; // User ID we passed in checkout
    const paymentStatus = data.payment_status;
    const token = data.token; // Subscription token

    try {
      if (paymentStatus === 'COMPLETE') {
        // Payment successful - activate subscription
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            payfast_token: token,
            payfast_subscription_id: data.subscription_id || token,
            status: 'active',
          }, {
            onConflict: 'user_id',
          });

        console.log(`Subscription activated for user ${userId}`);
      } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
        // Payment cancelled or failed
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
          })
          .eq('user_id', userId);

        console.log(`Subscription cancelled for user ${userId}`);
      }

      // PayFast expects 'OK' response
      return new NextResponse('OK', { status: 200 });
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      return new NextResponse('ERROR', { status: 500 });
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}
