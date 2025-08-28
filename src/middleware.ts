
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/skin-analysis', '/blood-report', '/hospitals', '/chat'];

export function middleware(request: NextRequest) {
  // This is a mock authentication check.
  // In a real app, you'd verify a token from cookies or headers.
  const isAuthenticated = request.cookies.get('mockAuth')?.value === 'true';

  const { pathname } = request.nextUrl;

  if (protectedRoutes.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
