'use client'

import { useState, useEffect } from 'react'

type AdminEntry = { id: number; email: string; addedBy: string | null; createdAt: string }

export default function PermisosPage() {
  const [admins, setAdmins] = useState<AdminEntry[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [superAdmin, setSuperAdmin] = useState('')

  useEffect(() => {
    fetch('/api/admin/permisos').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAdmins(data)
    })
    fetch('/api/admin/permisos/super').then(r => r.json()).then(data => {
      if (data.email) setSuperAdmin(data.email)
    }).catch(() => {})
  }, [])

  async function agregar() {
    if (!email.trim()) return
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/permisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error || 'Error al agregar')
      } else {
        setMsg('✓ Agregado correctamente')
        setAdmins(prev => [...prev, data])
        setEmail('')
      }
    } catch {
      setMsg('Error de conexión')
    }
    setLoading(false)
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este email autorizado?')) return
    const res = await fetch('/api/admin/permisos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setAdmins(prev => prev.filter(a => a.id !== id))
      setMsg('✓ Eliminado')
    }
  }

  const s = {
    input: {
      width: '100%',
      padding: '8px 12px',
      background: '#141f14',
      border: '1px solid #2a4a2a',
      borderRadius: 8,
      color: '#c8e8c8',
      fontSize: 14,
    } as React.CSSProperties,
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: 4 }}>Permisos de acceso</h1>
      <p style={{ fontSize: 13, color: '#4a7a4a', marginBottom: '1.5rem' }}>
        Administrá qué cuentas de Google pueden acceder a este panel.
      </p>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#a8d4a8', marginBottom: 6 }}>Super admin</div>
        <div style={{ fontSize: 13, color: '#5fba7a', fontFamily: 'monospace', marginBottom: 4 }}>{superAdmin || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'cargando...'}</div>
        <div style={{ fontSize: 11, color: '#3a5a3a' }}>Este email siempre tiene acceso y no puede ser removido.</div>
      </div>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#a8d4a8', marginBottom: 14 }}>Agregar email autorizado</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={s.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ej: empleado@gmail.com"
            onKeyDown={e => e.key === 'Enter' && agregar()}
          />
          <button
            onClick={agregar}
            disabled={!email.trim() || loading}
            style={{ padding: '8px 18px', background: '#2a5a2a', color: '#c8e8c8', border: '1px solid #3a6a3a', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
        {msg && <div style={{ marginTop: 10, fontSize: 12, color: msg.startsWith('✓') ? '#4a9a4a' : '#9a4a4a' }}>{msg}</div>}
      </div>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e321e', fontSize: 14, fontWeight: 600, color: '#c8e8c8' }}>
          Emails autorizados ({admins.length})
        </div>
        {admins.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#3a5a3a', fontSize: 13 }}>No hay otros emails autorizados.</div>
        ) : (
          admins.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < admins.length - 1 ? '1px solid #1e321e' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, color: '#c8e8c8' }}>{a.email}</div>
                <div style={{ fontSize: 11, color: '#4a7a4a' }}>Agregado por: {a.addedBy || '—'} · {new Date(a.createdAt).toLocaleDateString('es-AR')}</div>
              </div>
              <button
                onClick={() => eliminar(a.id)}
                style={{ padding: '4px 10px', background: 'transparent', color: '#c06060', border: '1px solid #2a1a1a', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
              >
                ✕ Quitar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
