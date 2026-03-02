import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Store routing middleware — supports TWO access patterns:
 *
 * 1. Subdomain-based (production & local):
 *      demo.localhost:3001       → /store/demo
 *      mystore.matgarco.com      → /store/mystore
 *
 * 2. Path-based (local dev shortcut):
 *      localhost:3001/demo-store          → /store/demo-store
 *      localhost:3001/demo-store/products → /store/demo-store/products
 *
 * The /store/* routes are always available directly too.
 */

// Routes that belong to the Next.js app itself, NOT store subdomains
const RESERVED_PATHS = new Set([
  'store', 'api', '_next', 'favicon.ico',
]);

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const isPreview = url.searchParams.get('preview') === '1';

  // Skip static files and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Helper: build a response and attach common headers
  function buildResponse(response: NextResponse, sub?: string) {
    if (sub) response.headers.set('x-subdomain', sub);
    if (isPreview) response.headers.set('x-preview', '1');
    return response;
  }

  // ── 1. Subdomain-based routing ──
  const hostWithoutPort = hostname.split(':')[0];
  const rootDomains = ['matgarco.com', 'localhost', 'vercel.app'];
  let subdomain = '';

  for (const root of rootDomains) {
    if (hostWithoutPort.endsWith(`.${root}`) || hostWithoutPort.includes(`.${root}`)) {
      subdomain = hostWithoutPort.replace(`.${root}`, '').split('.').pop() || '';
      break;
    }
  }

  if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
    // Already under /store/* — skip rewrite but still attach headers
    if (url.pathname.startsWith('/store/')) {
      return buildResponse(NextResponse.next(), subdomain);
    }

    const rewrittenUrl = url.clone();
    rewrittenUrl.pathname = `/store/${subdomain}${url.pathname}`;
    return buildResponse(NextResponse.rewrite(rewrittenUrl), subdomain);
  }

  // ── 2. Path-based routing (e.g. /demo-store → /store/demo-store) ──
  if (!url.pathname.startsWith('/store/')) {
    const segments = url.pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    if (firstSegment && !RESERVED_PATHS.has(firstSegment) && /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(firstSegment)) {
      const rewrittenUrl = url.clone();
      rewrittenUrl.pathname = `/store${url.pathname}`;
      return buildResponse(NextResponse.rewrite(rewrittenUrl), firstSegment);
    }
  }

  // ── 3. Direct /store/* access — still attach preview header ──
  if (isPreview) {
    return buildResponse(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
