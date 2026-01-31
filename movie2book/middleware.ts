import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard: allow if Supabase user OR valid Gumroad cookie (m2b_auth)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (user) {
      return response;
    }
    const token = request.cookies.get('m2b_auth')?.value;
    if (token && process.env.NEXTAUTH_SECRET) {
      try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        await jose.jwtVerify(token, secret);
        return response;
      } catch {
        // invalid or expired token
      }
    }
    return NextResponse.redirect(new URL('/subscribe', request.url));
  }

  // Protect upload and processing routes (Supabase auth only)
  if (request.nextUrl.pathname.startsWith('/upload') ||
      request.nextUrl.pathname.startsWith('/processing') ||
      request.nextUrl.pathname.startsWith('/result')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
