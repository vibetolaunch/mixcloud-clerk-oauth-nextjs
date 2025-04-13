// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(() => {
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // match everything except static files and _next
    '/api/(.*)',              // ensure it catches API routes like /api/auth/mixcloud/callback
  ],
};
