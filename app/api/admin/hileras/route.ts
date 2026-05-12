import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hileras, auditLog } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

async function log(action: string, entityId: number | null, summary: string, changes?: any) {
  const session = await auth()
  await db.insert(auditLog).values({
    action,
    entityType: 'hilera',
    entityId,
    summary,
    changes: changes ?? null,
    userEmail: session?.user?.email ?? 'desconocido',
  })
}

export async function GET() {
  const todas = await db.query.hileras.findMany({
    with: { variedad: true, variedadA: true, variedadB: true },
    orderBy: [desc(hileras.createdAt)],
  })
  return NextResponse.json(todas)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const [nueva] = await db.insert(hileras).values({
      variedadId: body.variedad_id ?? null,
      variedadAId: body.variedad_a_id ?? null,
      variedadBId: body.variedad_b_id ?? null,
      split: body.split ?? false,
      poste: body.poste ?? null,
      plantas: body.plantas ?? null,
      lat1: body.lat1,
      lng1: body.lng1,
      lat2: body.lat2,
      lng2: body.lng2,
      longitudM: body.longitud_m,
      anchoM: body.ancho_m ?? 2.5,
      anio: body.anio ?? new Date().getFullYear(),
      notas: body.notas ?? null,
    }).returning()

    const resumen = `Creó hilera${body.poste ? ' #' + body.poste : ''} (${body.longitud_m?.toFixed(1) || '?'}m, ${body.plantas || '?'} plantas)`
    await log('created', nueva.id, resumen, { poste: body.poste, plantas: body.plantas, longitud_m: body.longitud_m })

    return NextResponse.json(nueva, { status: 201 })
  } catch (error) {
    console.error('Error creando hilera:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const antes = await db.query.hileras.findFirst({ where: eq(hileras.id, body.id) })

    const [actualizada] = await db.update(hileras)
      .set({
        variedadId: body.variedad_id ?? null,
        variedadAId: body.variedad_a_id ?? null,
        variedadBId: body.variedad_b_id ?? null,
        split: body.split ?? false,
        poste: body.poste ?? null,
        plantas: body.plantas ?? null,
        lat1: body.lat1,
        lng1: body.lng1,
        lat2: body.lat2,
        lng2: body.lng2,
        longitudM: body.longitud_m,
        anchoM: body.ancho_m ?? 2.5,
        anio: body.anio ?? new Date().getFullYear(),
        notas: body.notas ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hileras.id, body.id))
      .returning()

    const cambios: string[] = []
    if (antes) {
      if (antes.poste !== body.poste) cambios.push(`poste: ${antes.poste || '—'} → ${body.poste || '—'}`)
      if (antes.plantas !== body.plantas) cambios.push(`plantas: ${antes.plantas ?? '—'} → ${body.plantas ?? '—'}  ⚠️`)
      if (antes.notas !== body.notas) cambios.push(`notas: "${antes.notas || ''}" → "${body.notas || ''}"`)
      if (antes.anio !== body.anio) cambios.push(`año: ${antes.anio} → ${body.anio}`)
    }

    if (cambios.length > 0) {
      const resumen = `Editó hilera #${body.poste || body.id} (${cambios.join(', ')})`
      await log('updated', body.id, resumen, { before: antes, after: actualizada })
    }

    return NextResponse.json(actualizada)
  } catch (error) {
    console.error('Error actualizando hilera:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const existente = await db.query.hileras.findFirst({ where: eq(hileras.id, id) })

    await db.delete(hileras).where(eq(hileras.id, id))

    const resumen = `Eliminó hilera${existente?.poste ? ' #' + existente.poste : ''}`
    await log('deleted', id, resumen, existente)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando hilera:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
