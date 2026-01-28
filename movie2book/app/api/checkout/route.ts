import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LEMONSQUEEZY_API_KEY, STORE_ID, VARIANT_ID } from '@/lib/lemonsqueezy';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!STORE_ID || !VARIANT_ID || !LEMONSQUEEZY_API_KEY) {
      console.error('Missing Lemon Squeezy configuration:', {
        hasStoreId: !!STORE_ID,
        hasVariantId: !!VARIANT_ID,
        hasApiKey: !!LEMONSQUEEZY_API_KEY,
      });
      return NextResponse.json(
        { error: 'Lemon Squeezy not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();

    // Create checkout link using Lemon Squeezy API
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: null, // Use variant's default price
            product_options: {
              name: 'Movie2Book Pro',
              description: 'Unlimited video to book conversions',
              media: [],
              redirect_url: `${request.nextUrl.origin}/dashboard?success=true`,
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
              desc: true,
              discount: true,
              dark: true,
              subscription_preview: true,
            },
            checkout_data: {
              email: userData?.email || '',
              name: userData?.user_metadata?.full_name || '',
              custom: {
                user_id: user.id,
              },
            },
            preview: false,
            expires_at: null,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: VARIANT_ID,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lemon Squeezy API error:', errorText);
      throw new Error(`Failed to create checkout: ${response.statusText}`);
    }

    const checkout = await response.json();
    const checkoutUrl = checkout.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new Error('Failed to get checkout URL from response');
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
