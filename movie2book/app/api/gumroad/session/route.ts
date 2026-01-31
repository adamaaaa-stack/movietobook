import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

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
    return NextResponse.json({
      auth: 'gumroad',
      email: (payload as { email?: string }).email,
    });
  } catch {
    return NextResponse.json({ auth: null }, { status: 401 });
  }
}
