import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS_DURING_MAINTENANCE = [
  '/maintenance',
  '/login',
  '/register',
  '/forgot-password',
  '/auth/callback',
  '/verify-email',
  '/reset-password',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/blog',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.');

  if (isAdminRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(new URL('/api/check-maintenance', request.url), {
      cache: 'no-store',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.maintenanceMode === true) {
        const isPublicPath = PUBLIC_PATHS_DURING_MAINTENANCE.some((path) => pathname.startsWith(path));
        if (!isPublicPath) {
          const redirectUrl = new URL('/maintenance', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking maintenance mode:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

