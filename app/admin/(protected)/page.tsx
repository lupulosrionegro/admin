import { db } from '@/lib/db'
import { hileras, variedades } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function AdminDashboard() {
  const todasHileras = await db.query.hileras.findMany({
    with: { variedad: true, variedadA: true, variedadB: true },
    orderBy: [desc(hileras.createdAt)],
    limit: 50,
  })

  const conteoVariedades: Record<string, { hileras: number; plantas: number }> = {}

  todasHileras.forEach(h => {
    if (h.split) {
      const vA = (h.variedadA as any)?.nombre || 'Sin variedad'
      const vB = (h.variedadB as any)?.nombre || 'Sin variedad'
      if (!conteoVariedades[vA]) conteoVariedades[vA] = { hileras: 0, plantas: 0 }
      if (!conteoVariedades[vB]) conteoVariedades[vB] = { hileras: 0, plantas: 0 }
      conteoVariedades[vA].hileras++
      conteoVariedades[vA].plantas += (h.plantas || 0) / 2
      conteoVariedades[vB].hileras++
      conteoVariedades[vB].plantas += (h.plantas || 0) / 2
    } else {
      const v = (h.variedad as any)?.nombre || 'Sin variedad'
      if (!conteoVariedades[v]) conteoVariedades[v] = { hileras: 0, plantas: 0 }
      conteoVariedades[v].hileras++
      conteoVariedades[v].plantas += (h.plantas || 0)
    }
  })

  const totalHileras = todasHileras.length
  const totalPlantas = todasHileras.reduce((s, h) => s + (h.plantas || 0), 0)
  const totalHa = todasHileras.reduce((s, h) => s + (h.longitudM * h.anchoM) / 10000, 0)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: 4 }}>Panel de Hileras</h1>
        <p style={{ fontSize: 13, color: '#4a7a4a' }}>Gestión de líneas de plantación, carteles y registro de plantas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#5fba7a' }}>{totalHileras}</div>
          <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 4 }}>Hileras</div>
        </div>
        <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#a8d4a8' }}>{totalPlantas}</div>
          <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 4 }}>Plantas</div>
        </div>
        <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#d4922a' }}>{totalHa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 4 }}>Hectáreas</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/hileras"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#2a5a2a', color: '#c8e8c8', border: '1px solid #3a6a3a', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
          🗺 Ir al mapa de hileras
        </Link>
      </div>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e321e', fontSize: 14, fontWeight: 600, color: '#c8e8c8' }}>🌱 Resumen por variedad</div>
        {Object.entries(conteoVariedades).map(([nombre, datos], i) => (
          <div key={nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < Object.keys(conteoVariedades).length - 1 ? '1px solid #1e321e' : 'none' }}>
            <span style={{ fontSize: 14, color: '#c8e8c8', fontWeight: 500 }}>{nombre}</span>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6a9a6a' }}>
              <span>{datos.hileras} hileras</span>
              <span>{datos.plantas} plantas</span>
            </div>
          </div>
        ))}
        {Object.keys(conteoVariedades).length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#3a5a3a', fontSize: 13 }}>Sin hileras registradas. Creá la primera desde el mapa.</div>
        )}
      </div>
    </div>
  )
}
