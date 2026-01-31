import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import axios from 'axios';

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  const licenseKey = req.nextUrl.searchParams.get('license_key');
  if (!licenseKey || typeof licenseKey !== 'string') {
    return NextResponse.redirect(new URL('/subscribe?error=no_license', req.url));
  }

  if (!GUMROAD_PRODUCT_ID) {
    return NextResponse.redirect(new URL('/subscribe?error=config', req.url));
  }

  if (!NEXTAUTH_SECRET) {
    console.error('[gumroad/callback] NEXTAUTH_SECRET not set');
    return NextResponse.redirect(new URL('/subscribe?error=config', req.url));
  }

  try {
    const verifyResponse = await axios.post(
      'https://api.gumroad.com/v2/license_key/verify',
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

    if (!verifyResponse.data?.success) {
      return NextResponse.redirect(new URL('/subscribe?error=invalid_license', req.url));
    }

    const email = verifyResponse.data.purchase?.email;
    if (!email) {
      return NextResponse.redirect(new URL('/subscribe?error=no_email', req.url));
    }

    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
    const token = await new jose.SignJWT({
      email,
      licenseKey: licenseKey,
    })
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

    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('[gumroad/callback]', error);
    return NextResponse.redirect(new URL('/subscribe?error=server_error', req.url));
  }
}
