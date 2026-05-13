import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  try {
    const session = await auth()
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/admin') && !session && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/admin/:path*',
}