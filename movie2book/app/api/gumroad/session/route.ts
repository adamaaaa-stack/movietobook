import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { createAdminClient } from '@/lib/supabase/admin';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  if (!NEXTAUTH_SECRET) {
    return NextResponse.json({ auth: null }, { status: 401 });
  }
  const token = req.cookies.get('m2b_auth')?.value;
  if (!token) {
    return NextResponse.json({ auth: null }, { status: 401 });
  }
  try {
    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const { email, userId } = payload as { email?: string; userId?: string };
    let booksRemaining = 0;
    if (userId) {
      try {
        const admin = createAdminClient();
        const { data: sub } = await admin
          .from('user_subscriptions')
          .select('books_remaining')
          .eq('user_id', userId)
          .maybeSingle();
        booksRemaining = sub?.books_remaining ?? 0;
      } catch {
        // ignore
      }
    }
    return NextResponse.json({
      auth: 'gumroad',
      email,
      booksRemaining,
    });
  } catch {
    return NextResponse.json({ auth: null }, { status: 401 });
  }
}
