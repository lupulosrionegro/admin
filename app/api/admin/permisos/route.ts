import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admins } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const lista = await db.query.admins.findMany({
    orderBy: (admins, { asc }) => [asc(admins.email)],
  })
  return NextResponse.json(lista)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const existe = await db.query.admins.findFirst({
      where: eq(admins.email, email.toLowerCase()),
    })
    if (existe) {
      return NextResponse.json({ error: 'Ya está autorizado' }, { status: 409 })
    }

    const [nuevo] = await db.insert(admins).values({
      email: email.toLowerCase(),
      addedBy: session.user.email,
    }).returning()

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { id } = await req.json()
    await db.delete(admins).where(eq(admins.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
