import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !session && !pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
