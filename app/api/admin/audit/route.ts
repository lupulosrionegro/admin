import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auditLog } from '@/lib/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const logs = await db.query.auditLog.findMany({
    orderBy: [desc(auditLog.createdAt)],
    limit: 100,
  })
  return NextResponse.json(logs)
}
