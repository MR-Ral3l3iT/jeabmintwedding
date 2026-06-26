import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest): NextResponse {
  const token = req.cookies.get('admin-token');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname.startsWith('/admin/login');

  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
