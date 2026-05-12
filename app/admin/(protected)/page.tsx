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

  const fs = "'SF Pro Text', system-ui, sans-serif"

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f5f5f7', marginBottom: 4, letterSpacing: '-0.01em', fontFamily: "'SF Pro Display', system-ui, sans-serif" }}>Panel</h1>
        <p style={{ fontSize: 13, color: '#636366', fontFamily: fs }}>Gestión de líneas de plantación, carteles y registro de plantas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#5fba7a', fontFamily: fs }}>{totalHileras}</div>
          <div style={{ fontSize: 12, color: '#636366', marginTop: 4, fontFamily: fs }}>Hileras</div>
        </div>
        <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f7', fontFamily: fs }}>{totalPlantas}</div>
          <div style={{ fontSize: 12, color: '#636366', marginTop: 4, fontFamily: fs }}>Plantas</div>
        </div>
        <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#5fba7a', fontFamily: fs }}>{totalHa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#636366', marginTop: 4, fontFamily: fs }}>Hectáreas</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <a href="/admin/hileras" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#5fba7a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: fs }}>
          🗺 Ir al mapa de hileras
        </a>
      </div>

      <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', fontSize: 14, fontWeight: 600, color: '#f5f5f7', fontFamily: "'SF Pro Display', system-ui, sans-serif" }}>🌱 Resumen por variedad</div>
        {Object.entries(conteoVariedades).map(([nombre, datos], i) => (
          <div key={nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < Object.keys(conteoVariedades).length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span style={{ fontSize: 13, color: '#f5f5f7', fontWeight: 500, fontFamily: fs }}>{nombre}</span>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#98989d', fontFamily: fs }}>
              <span>{datos.hileras} hileras</span>
              <span>{datos.plantas} plantas</span>
            </div>
          </div>
        ))}
        {Object.keys(conteoVariedades).length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#636366', fontSize: 13, fontFamily: fs }}>Sin hileras registradas. Creá la primera desde el mapa.</div>
        )}
      </div>
    </div>
  )
}
