import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'sale') {
      console.log('[webhook/gumroad] New sale:', data?.email);
      // TODO: Store in DB or sync to user_subscriptions if needed
    } else if (type === 'refund') {
      console.log('[webhook/gumroad] Refund:', data?.email);
      // TODO: Deactivate license in DB if needed
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
