import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import axios from 'axios';

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

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

    const email = response.data.purchase?.email;
    if (!email) {
      return NextResponse.json({ valid: false, error: 'No email on purchase' }, { status: 401 });
    }

    if (!NEXTAUTH_SECRET) {
      console.error('[gumroad/verify] NEXTAUTH_SECRET not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
    const token = await new jose.SignJWT({ email, licenseKey })
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
      ? (error as { response?: { status: number; data?: unknown } })
      : null;
    console.error(
      '[gumroad/verify]',
      axiosError
        ? `Gumroad API ${axiosError.response?.status} ${JSON.stringify(axiosError.response?.data)}`
        : error
    );
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
