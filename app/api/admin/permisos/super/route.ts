import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ email: process.env.ADMIN_EMAIL || '' })
}
