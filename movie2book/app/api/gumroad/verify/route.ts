import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import axios from 'axios';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const GUMROAD_CREDITS = 10;

export async function POST(req: NextRequest) {
  if (!GUMROAD_PRODUCT_ID) {
    return NextResponse.json({ error: 'Gumroad not configured' }, { status: 500 });
  }

  let body: { licenseKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const licenseKey = body.licenseKey?.trim();
  if (!licenseKey) {
    return NextResponse.json({ valid: false, error: 'License key required' }, { status: 400 });
  }

  try {
    const response = await axios.post(
      'https://api.gumroad.com/v2/licenses/verify',
      new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
        increment_uses_count: 'false',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data?.success) {
      console.log('[gumroad/verify] Invalid or expired key', response.data?.message);
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const gumroadEmail = response.data.purchase?.email;
    if (!gumroadEmail) {
      return NextResponse.json({ valid: false, error: 'No email on purchase' }, { status: 401 });
    }

    if (!NEXTAUTH_SECRET) {
      console.error('[gumroad/verify] NEXTAUTH_SECRET not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[gumroad/verify] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Server not configured (Supabase)' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Grant credits to whoever is verifying — no need for Gumroad email to match
    let userId: string;
    let email: string;
    const admin = createAdminClient();

    if (currentUser?.id) {
      userId = currentUser.id;
      email = currentUser.email ?? gumroadEmail;
    } else {
      // No logged-in user: get or create Supabase user by Gumroad purchase email
      email = gumroadEmail;
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password: crypto.randomUUID() + crypto.randomUUID().replace(/-/g, ''),
        email_confirm: true,
      });
      if (newUser?.user) {
        userId = newUser.user.id;
      } else {
        const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const byEmail = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!byEmail) {
          console.error('[gumroad/verify] createUser failed and user not found by email', createError?.message, email);
          return NextResponse.json(
            { error: 'Could not create or link account. Try again or contact support.' },
            { status: 500 }
          );
        }
        userId = byEmail.id;
      }
    }

    const { data: existingSub, error: subSelectError } = await admin
      .from('user_subscriptions')
      .select('id, books_remaining')
      .eq('user_id', userId)
      .maybeSingle();

    if (subSelectError) {
      console.error('[gumroad/verify] user_subscriptions select failed', subSelectError.message, subSelectError.code);
      return NextResponse.json(
        { error: 'Database error. Ensure RUN_IN_SUPABASE.sql has been run in Supabase SQL Editor.' },
        { status: 500 }
      );
    }

    if (existingSub) {
      const { error: updateError } = await admin
        .from('user_subscriptions')
        .update({
          books_remaining: (existingSub.books_remaining ?? 0) + GUMROAD_CREDITS,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      if (updateError) {
        console.error('[gumroad/verify] user_subscriptions update failed', updateError.message);
        return NextResponse.json({ error: 'Failed to add credits. Try again.' }, { status: 500 });
      }
    } else {
      const { error: upsertError } = await admin.from('user_subscriptions').upsert(
        {
          user_id: userId,
          status: 'active',
          free_conversions_used: true,
          books_remaining: GUMROAD_CREDITS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (upsertError) {
        console.error('[gumroad/verify] user_subscriptions upsert failed', upsertError.message, upsertError.code);
        return NextResponse.json(
          { error: 'Database error. Run RUN_IN_SUPABASE.sql in Supabase SQL Editor, then try again.' },
          { status: 500 }
        );
      }
    }

    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
    const token = await new jose.SignJWT({ email, licenseKey, userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('m2b_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({
      valid: true,
      email,
      createdAt: response.data.purchase?.created_at,
    });
  } catch (error: unknown) {
    const axiosError = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { status: number; data?: { message?: string } } })
      : null;
    if (axiosError?.response) {
      const { status, data } = axiosError.response;
      const message = typeof data?.message === 'string' ? data.message : 'Invalid or expired license key.';
      console.log('[gumroad/verify] Gumroad API', status, message);
      if (status >= 400 && status < 500) {
        return NextResponse.json({ valid: false, error: message }, { status: 401 });
      }
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error('[gumroad/verify] unexpected error', errMsg, errStack || '');
    return NextResponse.json(
      { valid: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
