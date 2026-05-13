'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import './hileras.css'

type Variedad = { id: number; nombre: string; descripcion: string | null; activa: boolean }

type Hilera = {
  id?: number
  variedad_id: number | null
  variedad_a_id: number | null
  variedad_b_id: number | null
  split: boolean
  poste: string
  plantas: number | null
  lat1: number
  lng1: number
  lat2: number
  lng2: number
  longitud_m: number
  ancho_m: number
  anio: number
  notas: string
}

const CHACRA_CENTER: [number, number] = [-39.1468, -67.1482]
const CHACRA_ZOOM = 19

const VARIEDAD_COLORS: Record<string, string> = {
  victoria: '#2ecc71',
  cascade: '#e67e22',
  bullion: '#7b1fa2',
  willamette: '#1abc9c',
  saaz: '#e74c3c',
  mapuche: '#3498db',
  traful: '#9b59b6',
  columbus: '#f1c40f',
  centennial: '#e91e63',
  chinook: '#00bcd4',
  citra: '#ff5722',
  mosaic: '#673ab7',
  nugget: '#f39c12',
  aramis: '#2c3e50',
  hallertau: '#16a085',
  hersbrucker: '#c0392b',
  spalter: '#2980b9',
  tettnanger: '#8e44ad',
  polaris: '#d35400',
}

const VARIEDAD_FALLBACK_COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#673ab7', '#f39c12']

function getColorForVariedad(nombre: string): string {
  const lower = nombre.toLowerCase()
  if (VARIEDAD_COLORS[lower]) return VARIEDAD_COLORS[lower]
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) | 0
  return VARIEDAD_FALLBACK_COLORS[Math.abs(hash) % VARIEDAD_FALLBACK_COLORS.length]
}

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function areaHa(longitudM: number, anchoM: number) {
  return (longitudM * anchoM) / 10000
}

function buildCartelHTML(h: Hilera, variedades: Variedad[], printMode = false) {
  const sp = h.split
  const nombreVarA = variedades.find(v => v.id === (sp ? h.variedad_a_id : h.variedad_id))?.nombre || '—'
  const nombreVarB = sp ? variedades.find(v => v.id === h.variedad_b_id)?.nombre || '—' : null
  const colorA = getColorForVariedad(nombreVarA)
  const bgA = colorA + '18'
  const colorB = sp ? getColorForVariedad(nombreVarB || '') : null
  const bgB = sp ? colorB + '18' : null
  const plantasTotal = h.plantas ?? 0
  const plantasHalf = sp ? Math.round(plantasTotal / 2) : plantasTotal
  const plantasStr = h.plantas ?? '—'
  const area = areaHa(h.longitud_m, h.ancho_m).toFixed(2)
  const poste = h.poste || '—'
  const anio = h.anio || '—'
  const notas = h.notas || ''
  const longitud = h.longitud_m.toFixed(1)

  const numFont = "'Rye', Georgia, serif"
  const logo = `<img src="/logo-lupulos.png" alt="Lúpulos Río Negro" style="width:28px;height:28px;border-radius:50%;display:inline-block" />`

  if (sp) {
    return `<div style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.5)">
      <div style="display:flex;border-bottom:2px solid #1a2a1a">
        <div style="flex:1;padding:8px 10px;border-right:1px solid #ddd;background:${bgA}">
          <div style="font-size:9px;color:#555;font-family:monospace">LADO A</div>
          <div style="font-size:14px;font-weight:700;color:#1a2a1a;font-family:monospace">${nombreVarA.toUpperCase()}</div>
          <div style="font-size:11px;color:#666;font-family:monospace;margin-top:4px">${plantasHalf} plantas</div>
        </div>
        <div style="flex:1;padding:8px 10px;background:${bgB}">
          <div style="font-size:9px;color:#555;font-family:monospace">LADO B</div>
          <div style="font-size:14px;font-weight:700;color:#1a2a1a;font-family:monospace">${nombreVarB?.toUpperCase()}</div>
          <div style="font-size:11px;color:#666;font-family:monospace;margin-top:4px">${plantasHalf} plantas</div>
        </div>
      </div>
      <div style="padding:8px 10px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:9px;color:#666;font-family:monospace">HILERA N°</div><div style="font-size:24px;font-weight:700;color:#1a2a1a;line-height:1;font-family:${numFont}">${poste}</div></div>
        <div style="text-align:right">
          <div style="font-size:9px;color:#666;font-family:monospace">TOTAL PLANTAS</div>
          <div style="font-size:18px;font-weight:700;color:#1a2a1a;font-family:monospace">${plantasStr}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#f5f5f5">
        <div style="font-size:10px;color:#444;font-family:monospace">AÑO: ${anio}</div>
        <div style="font-size:10px;color:#444;font-family:'Oswald',sans-serif;letter-spacing:0.05em">www.lupulosrionegro.com</div>
        ${notas ? `<div style="font-size:9px;color:#777;font-family:monospace">${notas}</div>` : ''}
      </div>
    </div>`
  }

  return `<div style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.5)">
    <div style="padding:9px 11px 7px;border-bottom:2px solid #1a2a1a">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div style="font-size:9px;color:#555;font-family:monospace">HILERA N°</div>
          <div style="font-size:26px;font-weight:700;color:#1a2a1a;line-height:1;font-family:${numFont}">${poste}</div></div>
        <div style="text-align:right">
          <div style="font-size:9px;color:#666;font-family:monospace">PLANTAS</div>
          <div style="font-size:16px;font-weight:700;color:#1a2a1a;font-family:monospace">${plantasStr}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <div style="font-size:13px;font-weight:700;color:#1a2a1a;letter-spacing:.02em">${nombreVarA.toUpperCase()}</div>
        <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center">${logo}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#f5f5f5">
      <div style="font-size:10px;color:#444;font-family:monospace">AÑO: ${anio}</div>
      <div style="font-size:10px;color:#444;font-family:'Oswald',sans-serif;letter-spacing:0.05em">www.lupulosrionegro.com</div>
    </div>
    ${notas ? `<div style="padding:5px 11px;border-top:1px solid #eee;font-size:9px;color:#777;font-family:monospace;text-align:center">${notas}</div>` : ''}
  </div>`
}

const MapComponent = dynamic(
  () => import('./map'),
  { ssr: false, loading: () => <div style={{ flex: 1, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636366', fontSize: 13 }}>Cargando mapa...</div> }
)

export default function HilerasPage() {
  const [variedades, setVariedades] = useState<Variedad[]>([])
  const [hilerasList, setHilerasList] = useState<Hilera[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'draw' | 'select'>('select')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bearing, setBearing] = useState(60)
  const [pendingHilera, setPendingHilera] = useState<{
    lat1: number; lng1: number; lat2: number; lng2: number; longitud_m: number
  } | null>(null)

  useEffect(() => {
    fetch('/api/variedades').then(r => r.json()).then(setVariedades)
    fetch('/api/admin/hileras').then(r => r.json()).then((data) => {
      const mapped = data.map((h: any) => ({
        id: h.id,
        variedad_id: h.variedadId ?? h.variedad_id ?? null,
        variedad_a_id: h.variedadAId ?? h.variedad_a_id ?? null,
        variedad_b_id: h.variedadBId ?? h.variedad_b_id ?? null,
        split: h.split ?? false,
        poste: h.poste ?? '',
        plantas: h.plantas ?? null,
        lat1: h.lat1,
        lng1: h.lng1,
        lat2: h.lat2,
        lng2: h.lng2,
        longitud_m: h.longitudM ?? h.longitud_m,
        ancho_m: h.anchoM ?? h.ancho_m ?? 2.5,
        anio: h.anio ?? new Date().getFullYear(),
        notas: h.notas ?? '',
      }))
      setHilerasList(mapped)
    })
  }, [])

  const handleHileraDrawn = useCallback((data: {
    lat1: number; lng1: number; lat2: number; lng2: number; longitud_m: number
  }) => {
    setPendingHilera(data)
    setViewMode('select')
  }, [])

  const handleHileraCreated = useCallback(async (hilera: Hilera) => {
    try {
      const res = await fetch('/api/admin/hileras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variedad_id: hilera.variedad_id,
          variedad_a_id: hilera.variedad_a_id,
          variedad_b_id: hilera.variedad_b_id,
          split: hilera.split,
          poste: hilera.poste,
          plantas: hilera.plantas,
          lat1: hilera.lat1,
          lng1: hilera.lng1,
          lat2: hilera.lat2,
          lng2: hilera.lng2,
          longitud_m: hilera.longitud_m,
          ancho_m: hilera.ancho_m,
          anio: hilera.anio,
          notas: hilera.notas,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setHilerasList(prev => [...prev, { ...hilera, id: created.id }])
        setSelectedIdx(hilerasList.length)
      } else {
        setHilerasList(prev => [...prev, hilera])
        setSelectedIdx(hilerasList.length)
      }
    } catch {
      setHilerasList(prev => [...prev, hilera])
      setSelectedIdx(hilerasList.length)
    }
    setPendingHilera(null)
  }, [hilerasList.length])

  const handleHileraUpdated = useCallback((idx: number, hilera: Hilera) => {
    setHilerasList(prev => {
      const next = [...prev]
      next[idx] = hilera
      return next
    })
  }, [])

  const handleHileraDeleted = useCallback(async (idx: number) => {
    const h = hilerasList[idx]
    if (h?.id) {
      try {
        await fetch('/api/admin/hileras', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: h.id }),
        })
      } catch {}
    }
    setHilerasList(prev => prev.filter((_, i) => i !== idx))
    setSelectedIdx(null)
  }, [hilerasList])

  const handleSelect = useCallback((idx: number | null) => {
    setSelectedIdx(idx)
  }, [])

  const selectedHilera = selectedIdx !== null && selectedIdx < hilerasList.length ? hilerasList[selectedIdx] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#0a0a0a', color: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rye&display=swap" rel="stylesheet" />
      <style>{`@font-face{font-family:'Oswald';src:url('/fonts/Oswald-VariableFont_wght.ttf') format('truetype');font-weight:400 700;}`}</style>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 44, background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/admin" style={{ color: '#98989d', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}>← Volver</a>
          <span style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: '#5fba7a', letterSpacing: '0.08em' }}>TRAZABILIDAD LÚPULO</span>
          <span style={{ fontSize: 11, color: '#636366', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>Chacra Arana · Río Negro</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#636366', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>-39.1468° S / -67.1482° O</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ fontSize: 11, color: '#5fba7a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500, padding: 0 }}>☰ Panel</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>


        <MapComponent
          hileras={hilerasList}
          selectedIdx={selectedIdx}
          viewMode={viewMode}
          variedades={variedades}
          bearing={bearing}
          onBearingChange={setBearing}
          onHileraDrawn={handleHileraDrawn}
          onSelect={handleSelect}
        />

        <div style={{ position: 'relative' }}>
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }} />}
          <Sidebar
            variedades={variedades}
            selectedHilera={selectedHilera}
            selectedIdx={selectedIdx}
            hilerasList={hilerasList}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onUpdate={(h) => { if (selectedIdx !== null) handleHileraUpdated(selectedIdx, h) }}
            onDelete={() => { if (selectedIdx !== null) handleHileraDeleted(selectedIdx) }}
            onSave={async () => {
              if (selectedIdx === null || !selectedHilera) return
              const h = selectedHilera
              const body = {
                id: h.id,
                variedad_id: h.variedad_id,
                variedad_a_id: h.variedad_a_id,
                variedad_b_id: h.variedad_b_id,
                split: h.split,
                poste: h.poste,
                plantas: h.plantas,
                lat1: h.lat1,
                lng1: h.lng1,
                lat2: h.lat2,
                lng2: h.lng2,
                longitud_m: h.longitud_m,
                ancho_m: h.ancho_m,
                anio: h.anio,
                notas: h.notas,
              }
              if (h.id) {
                await fetch('/api/admin/hileras', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
              } else {
                const res = await fetch('/api/admin/hileras', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                const created = await res.json()
                setHilerasList(prev => {
                  const next = [...prev]
                  next[selectedIdx] = { ...next[selectedIdx], id: created.id }
                  return next
                })
              }
            }}
          />
        </div>
      </div>

      {pendingHilera && (
        <HileraModal
          data={pendingHilera}
          variedades={variedades}
          onConfirm={handleHileraCreated}
          onCancel={() => setPendingHilera(null)}
        />
      )}
    </div>
  )
}

function Sidebar({
  variedades, selectedHilera, selectedIdx, hilerasList, viewMode, onViewModeChange, onUpdate, onDelete, onSave, sidebarOpen, onToggleSidebar,
}: {
  variedades: Variedad[]
  selectedHilera: Hilera | null
  selectedIdx: number | null
  hilerasList: Hilera[]
  viewMode: 'draw' | 'select'
  onViewModeChange: (m: 'draw' | 'select') => void
  onUpdate: (h: Hilera) => void
  onDelete: () => void
  onSave: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}) {
  const [saved, setSaved] = useState(false)
  const [anchoHilera, setAnchoHilera] = useState(2.5)

  const updateField = (field: keyof Hilera, value: any) => {
    if (!selectedHilera) return
    onUpdate({ ...selectedHilera, [field]: value })
  }

  useEffect(() => {
    if (selectedHilera) {
      setAnchoHilera(selectedHilera.ancho_m)
    }
  }, [selectedHilera?.id, selectedIdx])

  const handleSave = async () => {
    setSaved(true)
    await onSave()
    setTimeout(() => setSaved(false), 1200)
  }

  const metrosPorVariedad: Record<string, number> = {}
  hilerasList.forEach(h => {
    if (h.split) {
      const media = h.longitud_m / 2
      const vA = variedades.find(v => v.id === h.variedad_a_id)
      const vB = variedades.find(v => v.id === h.variedad_b_id)
      if (vA) metrosPorVariedad[vA.nombre] = (metrosPorVariedad[vA.nombre] || 0) + media
      if (vB) metrosPorVariedad[vB.nombre] = (metrosPorVariedad[vB.nombre] || 0) + media
    } else {
      const v = variedades.find(v => v.id === h.variedad_id)
      if (v) metrosPorVariedad[v.nombre] = (metrosPorVariedad[v.nombre] || 0) + h.longitud_m
    }
  })
  const totalMts = Object.values(metrosPorVariedad).reduce((a, b) => a + b, 0)

  const savedHileras = hilerasList.filter(h => h.poste).sort((a, b) => Number(a.poste) - Number(b.poste))

  const handleAnchoChange = (val: number) => {
    setAnchoHilera(val)
    updateField('ancho_m', val)
  }

  const inputS = {
    width: '100%',
    padding: '6px 8px',
    background: '#2c2c2e',
    border: '0.5px solid rgba(255,255,255,0.1)',
    color: '#f5f5f7',
    fontFamily: "'SF Pro Text', system-ui, sans-serif",
    fontSize: 12,
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelS = {
    fontFamily: "'SF Pro Text', system-ui, sans-serif",
    fontSize: 10,
    color: '#636366',
    letterSpacing: '0.03em',
    fontWeight: 500,
  }

  const as = { ...inputS, background: '#1c1c1e', color: '#5fba7a' }

  return (
    <aside className={`hileras-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 260, flexShrink: 0, background: 'rgba(28,28,30,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderLeft: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: 'rgba(44,44,46,0.5)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', flexShrink: 0 }}>
        <button onClick={onToggleSidebar} className="sidebar-close-btn" style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 11, padding: '5px 8px', border: '0.5px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#98989d', borderRadius: 6, cursor: 'pointer', display: 'none' }}>
          ✕
        </button>
        <button onClick={() => onViewModeChange('draw')} style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 11, padding: '5px 10px', border: `0.5px solid ${viewMode === 'draw' ? '#5fba7a' : 'rgba(255,255,255,0.12)'}`, background: viewMode === 'draw' ? 'rgba(95,186,122,0.15)' : 'transparent', color: viewMode === 'draw' ? '#5fba7a' : '#98989d', borderRadius: 6, cursor: 'pointer' }}>
          ✏ Trazar línea
        </button>
        <button onClick={() => onViewModeChange('select')} style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 11, padding: '5px 10px', border: `0.5px solid ${viewMode === 'select' ? '#5fba7a' : 'rgba(255,255,255,0.12)'}`, background: viewMode === 'select' ? 'rgba(95,186,122,0.15)' : 'transparent', color: viewMode === 'select' ? '#5fba7a' : '#98989d', borderRadius: 6, cursor: 'pointer' }}>
          ↖ Seleccionar
        </button>
        <button onClick={onDelete} style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 11, padding: '5px 10px', border: '0.5px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#ff453a', borderRadius: 6, cursor: 'pointer' }}>
          ✕ Eliminar
        </button>
      </div>

      <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', padding: '10px 12px 4px', fontWeight: 600, textTransform: 'uppercase' }}>VARIEDADES</div>
      {variedades.map(v => (
        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColorForVariedad(v.nombre), flexShrink: 0 }} />
          <span style={{ color: getColorForVariedad(v.nombre), fontWeight: 500 }}>{v.nombre}</span>
        </div>
      ))}

      <div style={{ height: 0.5, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', padding: '10px 12px 4px', fontWeight: 600, textTransform: 'uppercase' }}>METROS</div>
      {Object.entries(metrosPorVariedad).map(([nombre, mts]) => (
        <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 12px' }}>
          <span style={{ fontSize: 11, color: '#98989d', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>{nombre}</span>
          <span style={{ fontSize: 12, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: getColorForVariedad(nombre), fontWeight: 500 }}>{mts.toFixed(1)} m</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 12px' }}>
        <span style={{ fontSize: 11, color: '#98989d', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>TOTAL</span>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#5fba7a' }}>{totalMts.toFixed(1)} m</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 12px' }}>
        <span style={{ fontSize: 11, color: '#98989d', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>Hileras</span>
        <span style={{ fontSize: 12, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#f5f5f7' }}>{hilerasList.length}</span>
      </div>

      <div style={{ height: 0.5, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      {!selectedHilera && (
        <div style={{ color: '#636366', fontSize: 12, fontFamily: "'SF Pro Text', system-ui, sans-serif", padding: '16px 12px', lineHeight: 1.6 }}>
          Dibujá o seleccioná<br />una hilera<br />para editar
        </div>
      )}

      {selectedHilera && (
        <div style={{ padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>N° DE HILERA / POSTE</label>
            <input style={inputS} type="text" value={selectedHilera.poste} onChange={e => updateField('poste', e.target.value)} placeholder="ej: 1" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>CANTIDAD DE PLANTAS</label>
            <input style={inputS} type="number" value={selectedHilera.plantas ?? ''} onChange={e => updateField('plantas', e.target.value ? Number(e.target.value) : null)} placeholder="ej: 120" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>LONGITUD (metros)</label>
            <input style={as} type="text" value={selectedHilera.longitud_m.toFixed(1) + ' m'} readOnly />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>ÁREA (hectáreas)</label>
            <input style={as} type="text" value={areaHa(selectedHilera.longitud_m, selectedHilera.ancho_m).toFixed(2) + ' ha'} readOnly />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <input type="checkbox" id="f-split" checked={selectedHilera.split} onChange={e => updateField('split', e.target.checked)} style={{ accentColor: '#5fba7a' }} />
            <label htmlFor="f-split" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6a7a6a', cursor: 'pointer' }}>2 variedades (una por lado)</label>
          </div>

          {!selectedHilera.split && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={labelS}>VARIEDAD</label>
              <select style={inputS} value={selectedHilera.variedad_id ?? ''} onChange={e => updateField('variedad_id', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Seleccionar...</option>
                {variedades.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {selectedHilera.split && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#3d5a3d', letterSpacing: '0.08em', padding: '3px 0 1px' }}>LADO A (hilera izquierda)</div>
                <select style={inputS} value={selectedHilera.variedad_a_id ?? ''} onChange={e => updateField('variedad_a_id', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Seleccionar...</option>
                  {variedades.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#3d5a3d', letterSpacing: '0.08em', padding: '3px 0 1px' }}>LADO B (hilera derecha)</div>
                <select style={inputS} value={selectedHilera.variedad_b_id ?? ''} onChange={e => updateField('variedad_b_id', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Seleccionar...</option>
                  {variedades.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>AÑO</label>
            <input style={inputS} type="number" value={selectedHilera.anio} onChange={e => updateField('anio', Number(e.target.value))} min={2000} max={2099} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label style={labelS}>NOTAS (opcional)</label>
            <input style={inputS} type="text" value={selectedHilera.notas} onChange={e => updateField('notas', e.target.value)} placeholder="ej: sector norte" />
          </div>

          <button onClick={handleSave} style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 12, padding: '8px', background: '#5fba7a', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', width: '100%', textAlign: 'center', fontWeight: 500, letterSpacing: '0.01em' }}>
            {saved ? '✓ GUARDADO' : 'Guardar'}
          </button>
        </div>
      )}

      {selectedHilera && (
        <div style={{ padding: '10px 12px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>PREVISUALIZACIÓN</div>
          <div className="cartel" dangerouslySetInnerHTML={{ __html: buildCartelHTML(selectedHilera, variedades) }} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', fontFamily: "'IBM Plex Sans', sans-serif", overflow: 'hidden' }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button onClick={() => downloadCartel(selectedHilera, variedades, 'a5')} style={{ flex: 1, padding: '6px', background: 'rgba(95,186,122,0.12)', color: '#5fba7a', border: '0.5px solid rgba(95,186,122,0.3)', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>
              ⬇ A5
            </button>
            <button onClick={() => downloadCartel(selectedHilera, variedades, 'a4')} style={{ flex: 1, padding: '6px', background: 'rgba(95,186,122,0.12)', color: '#5fba7a', border: '0.5px solid rgba(95,186,122,0.3)', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>
              ⬇ A4
            </button>
            <button onClick={() => downloadEmptyCartel('a5')} style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.06)', color: '#98989d', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>
              A5 vacío
            </button>
            <button onClick={() => downloadEmptyCartel('a4')} style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.06)', color: '#98989d', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>
              A4 vacío
            </button>
          </div>
          {savedHileras.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>CARTELES</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <button onClick={() => { savedHileras.forEach((h, i) => setTimeout(() => downloadCartel(h, variedades, 'a4'), i * 600)) }} style={{ background: 'rgba(95,186,122,0.12)', border: '0.5px solid rgba(95,186,122,0.3)', borderRadius: 6, color: '#5fba7a', cursor: 'pointer', fontSize: 9, padding: '3px 8px', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>⬇ Todos A4</button>
                  <button onClick={() => downloadEmptyCartel('a4')} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#98989d', cursor: 'pointer', fontSize: 9, padding: '3px 8px', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontWeight: 500 }}>Vacío</button>
                </div>
              </div>
              {savedHileras.map((h, i) => {
                const nombreV = h.split
                  ? variedades.find(v => v.id === h.variedad_a_id)?.nombre + ' / ' + variedades.find(v => v.id === h.variedad_b_id)?.nombre
                  : variedades.find(v => v.id === h.variedad_id)?.nombre || '—'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <div style={{ flex: 1, background: '#2c2c2e', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>
                      <span style={{ color: getColorForVariedad(nombreV), fontWeight: 500 }}>Hilera {h.poste} · {nombreV}</span>
                      <span style={{ color: '#636366' }}>{areaHa(h.longitud_m, h.ancho_m).toFixed(2)} ha</span>
                    </div>
                    <button onClick={() => downloadCartel(h, variedades, 'a5')} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#98989d', cursor: 'pointer', fontSize: 10, padding: '4px 6px', lineHeight: 1, fontFamily: "'SF Pro Text', system-ui, sans-serif" }} title="Descargar A5">A5</button>
                    <button onClick={() => downloadCartel(h, variedades, 'a4')} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#98989d', cursor: 'pointer', fontSize: 10, padding: '4px 6px', lineHeight: 1, fontFamily: "'SF Pro Text', system-ui, sans-serif" }} title="Descargar A4">A4</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '10px 12px', maxHeight: 180, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>ACTIVIDAD</div>
        <ActivityLog />
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', letterSpacing: '0.05em', padding: '10px 0 6px', fontWeight: 600, textTransform: 'uppercase' }}>CONFIGURACIÓN</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#98989d', marginBottom: 2 }}>
          <span>Ancho de hilera</span>
          <span>{anchoHilera.toFixed(2)} m</span>
        </div>
        <input type="range" min={1} max={5} step={0.1} value={anchoHilera} onChange={e => handleAnchoChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#5fba7a' }} />
      </div>

      <footer style={{ padding: '4px 14px', background: 'rgba(44,44,46,0.5)', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, alignItems: 'center', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 10, color: '#636366', flexShrink: 0 }}>
        <span>Modo: {viewMode === 'draw' ? 'Trazar línea' : 'Seleccionar'}</span>
        <span>·</span>
        <span>{hilerasList.length} hileras</span>
      </footer>
    </aside>
  )
}

function HileraModal({ data, variedades, onConfirm, onCancel }: {
  data: { lat1: number; lng1: number; lat2: number; lng2: number; longitud_m: number }
  variedades: Variedad[]
  onConfirm: (h: Hilera) => void
  onCancel: () => void
}) {
  const [split, setSplit] = useState(false)
  const [variedadId, setVariedadId] = useState(variedades.length > 0 ? variedades[0].id : null)
  const [variedadAId, setVariedadAId] = useState(variedades.length > 0 ? variedades[0].id : null)
  const [variedadBId, setVariedadBId] = useState(variedades.length > 1 ? variedades[1].id : null)
  const [poste, setPoste] = useState('')
  const [plantas, setPlantas] = useState<number | null>(null)

  const inputS = { width: '100%', padding: '5px 7px', background: '#171f17', border: '1px solid #1e281e', color: '#e8f0e0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, borderRadius: 3, outline: 'none', boxSizing: 'border-box' as const }
  const labelS = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#3d5a3d', letterSpacing: '0.1em' }

  function commit(h: Hilera) {
    onConfirm(h)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 16, padding: 24, maxWidth: 380, width: '90%' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#c8e8c8', marginBottom: 4 }}>Nueva hilera</div>
        <div style={{ fontSize: 12, color: '#4a7a4a', marginBottom: 16 }}>{data.longitud_m.toFixed(1)} m · {((data.longitud_m * 2.5) / 10000).toFixed(2)} ha</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={labelS}>N° POSTE</label>
              <input style={inputS} value={poste} onChange={e => setPoste(e.target.value)} placeholder="ej: 1" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={labelS}>PLANTAS</label>
              <input style={inputS} type="number" value={plantas ?? ''} onChange={e => setPlantas(e.target.value ? Number(e.target.value) : null)} placeholder="ej: 120" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <input type="checkbox" checked={split} onChange={e => setSplit(e.target.checked)} style={{ accentColor: '#5fba7a' }} />
            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6a7a6a', cursor: 'pointer' }}>2 variedades (una por lado)</label>
          </div>

          {!split ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label style={labelS}>VARIEDAD</label>
              <select style={inputS} value={variedadId ?? ''} onChange={e => setVariedadId(e.target.value ? Number(e.target.value) : null)}>
                {variedades.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={labelS}>LADO A</label>
                <select style={inputS} value={variedadAId ?? ''} onChange={e => setVariedadAId(e.target.value ? Number(e.target.value) : null)}>
                  {variedades.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={labelS}>LADO B</label>
                <select style={inputS} value={variedadBId ?? ''} onChange={e => setVariedadBId(e.target.value ? Number(e.target.value) : null)}>
                  {variedades.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <button onClick={() => {
          const h: Hilera = split
            ? { variedad_id: null, variedad_a_id: variedadAId, variedad_b_id: variedadBId, split: true, poste, plantas, lat1: data.lat1, lng1: data.lng1, lat2: data.lat2, lng2: data.lng2, longitud_m: data.longitud_m, ancho_m: 2.5, anio: new Date().getFullYear(), notas: '' }
            : { variedad_id: variedadId, variedad_a_id: null, variedad_b_id: null, split: false, poste, plantas, lat1: data.lat1, lng1: data.lng1, lat2: data.lat2, lng2: data.lng2, longitud_m: data.longitud_m, ancho_m: 2.5, anio: new Date().getFullYear(), notas: '' }
          commit(h)
        }}
          disabled={split ? (!variedadAId || !variedadBId) : !variedadId}
          style={{ width: '100%', marginTop: 14, padding: '9px', background: (split ? (variedadAId && variedadBId) : variedadId) ? '#2a5a2a' : '#1f2a1f', color: (split ? (variedadAId && variedadBId) : variedadId) ? '#c8e8c8' : '#4a6a4a', border: '1px solid #3a6a3a', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: (split ? (variedadAId && variedadBId) : variedadId) ? 'pointer' : 'default', fontFamily: "'IBM Plex Mono', monospace" }}>
          Crear hilera
        </button>

        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#4a7a4a', fontSize: 11, cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", textDecoration: 'underline' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function downloadCartel(h: Hilera, variedades: Variedad[], format: 'a5' | 'a4' = 'a5') {
  const sp = h.split
  const nombreVarA = variedades.find(v => v.id === (sp ? h.variedad_a_id : h.variedad_id))?.nombre || '—'
  const nombreVarB = sp ? variedades.find(v => v.id === h.variedad_b_id)?.nombre || '—' : null
  const colorA = getColorForVariedad(nombreVarA)
  const colorB = sp ? getColorForVariedad(nombreVarB || '') : null
  const plantasTotal = h.plantas ?? 0
  const plantasStr = h.plantas ?? '—'
  const plantasHalf = sp ? Math.round(plantasTotal / 2) : plantasTotal
  const poste = h.poste || '—'
  const anio = h.anio || '—'
  const notas = h.notas || ''

  const W = 620
  const L = 30
  const labelY = 135
  const numY = 270
  const sepY = 305
  const varietyY = 330
  const varietyH = sp ? 80 : 60
  const bottomY = varietyY + varietyH + 30
  const svgH = bottomY + 30

  const varietyHTML = sp
    ? `<rect x="${L}" y="${varietyY}" width="275" height="80" rx="6" fill="${colorA}22" stroke="${colorA}" stroke-width="1.5"/>
       <text x="${L + 137}" y="${varietyY + 24}" text-anchor="middle" font-size="12" font-family="monospace" fill="#555" font-weight="bold">LADO A</text>
       <text x="${L + 137}" y="${varietyY + 50}" text-anchor="middle" font-size="22" font-weight="bold" fill="#1a2a1a" class="n">${nombreVarA.toUpperCase()}</text>
       <text x="${L + 137}" y="${varietyY + 70}" text-anchor="middle" font-size="11" fill="#666" font-family="monospace">${plantasHalf} plantas</text>
       <rect x="${L + 285}" y="${varietyY}" width="275" height="80" rx="6" fill="${colorB}22" stroke="${colorB}" stroke-width="1.5"/>
       <text x="${L + 425}" y="${varietyY + 24}" text-anchor="middle" font-size="12" font-family="monospace" fill="#555" font-weight="bold">LADO B</text>
       <text x="${L + 425}" y="${varietyY + 50}" text-anchor="middle" font-size="22" font-weight="bold" fill="#1a2a1a" class="n">${nombreVarB?.toUpperCase()}</text>
       <text x="${L + 425}" y="${varietyY + 70}" text-anchor="middle" font-size="11" fill="#666" font-family="monospace">${plantasHalf} plantas</text>`
    : `<rect x="${L}" y="${varietyY}" width="${W - 2*L}" height="${varietyH}" rx="6" fill="${colorA}22" stroke="${colorA}" stroke-width="1.5"/>
       <text x="${W/2}" y="${varietyY + 35}" text-anchor="middle" font-size="26" font-weight="bold" fill="#1a2a1a" class="n">${nombreVarA.toUpperCase()}</text>`

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Rye&amp;family=Oswald:wght@400&amp;display=swap');
      .n{font-family:'Rye',Georgia,serif}
      .w{font-family:'Oswald',sans-serif}
    </style>
  </defs>
  <rect width="${W}" height="${svgH}" rx="6" fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${W/2}" y="55" text-anchor="middle" font-size="11" fill="#999" font-family="monospace" font-weight="bold" letter-spacing="2">LÚPULOS RÍO NEGRO</text>
  <line x1="25" y1="68" x2="${W - 25}" y2="68" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${L}" y="${labelY}" font-size="12" fill="#888" font-family="monospace" font-weight="bold" letter-spacing="2">HILERA N°</text>
  <text x="${L}" y="${numY}" font-size="100" font-weight="bold" fill="#1a2a1a" class="n">${poste}</text>
  <text x="${W - L}" y="${labelY}" font-size="12" fill="#888" font-family="monospace" font-weight="bold" letter-spacing="2" text-anchor="end">${sp ? 'TOTAL PLANTAS' : 'PLANTAS'}</text>
  <text x="${W - L}" y="${numY}" font-size="52" font-weight="bold" fill="#1a2a1a" font-family="monospace" text-anchor="end">${plantasStr}</text>
  <line x1="${L}" y1="${sepY}" x2="${W - L}" y2="${sepY}" stroke="#e0e0e0" stroke-width="0.5"/>
  ${varietyHTML}
  <line x1="${L}" y1="${bottomY}" x2="${W - L}" y2="${bottomY}" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${L}" y="${bottomY + 22}" font-size="13" fill="#444" font-family="monospace">AÑO: ${anio}</text>
  ${notas ? `<text x="${W/2}" y="${bottomY + 22}" font-size="11" fill="#888" font-family="monospace" text-anchor="middle">${notas}</text>` : ''}
  <text x="${W - L}" y="${bottomY + 22}" font-size="11" fill="#999" class="w" text-anchor="end">www.lupulosrionegro.com</text>
</svg>`

  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)
  const svgImg = new Image()
  const logoImg = new Image()
  let loaded = 0
  const targetW = format === 'a4' ? 3508 : 2480
  const scale = targetW / W
  const actualH = Math.round(svgH * scale)
  const render = () => {
    loaded++
    if (loaded < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = actualH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetW, actualH)
    ctx.scale(scale, scale)
    ctx.drawImage(svgImg, 0, 0)
    ctx.drawImage(logoImg, W/2 - 14, 12, 28, 28)
    const a = document.createElement('a')
    a.download = `hilera-${poste}-${format.toUpperCase()}.jpg`
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.click()
    URL.revokeObjectURL(svgUrl)
  }
  svgImg.onload = render
  svgImg.onerror = () => URL.revokeObjectURL(svgUrl)
  logoImg.onload = render
  logoImg.onerror = render
  svgImg.src = svgUrl
  logoImg.src = window.location.origin + '/logo-lupulos.png'
}

function downloadEmptyCartel(format: 'a5' | 'a4' = 'a5') {
  const W = 620
  const L = 30
  const labelY = 135
  const numY = 270
  const sepY = 305
  const varietyY = 330
  const varietyH = 60
  const bottomY = varietyY + varietyH + 30
  const svgH = bottomY + 30
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Rye&amp;family=Oswald:wght@400&amp;display=swap');
      .n{font-family:'Rye',Georgia,serif}
      .w{font-family:'Oswald',sans-serif}
    </style>
  </defs>
  <rect width="${W}" height="${svgH}" rx="6" fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${W/2}" y="55" text-anchor="middle" font-size="11" fill="#999" font-family="monospace" font-weight="bold" letter-spacing="2">LÚPULOS RÍO NEGRO</text>
  <line x1="25" y1="68" x2="${W - 25}" y2="68" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${L}" y="${labelY}" font-size="12" fill="#888" font-family="monospace" font-weight="bold" letter-spacing="2">HILERA N°</text>
  <text x="${L}" y="${numY}" font-size="100" font-weight="bold" fill="#1a2a1a" class="n"> </text>
  <text x="${W - L}" y="${labelY}" font-size="12" fill="#888" font-family="monospace" font-weight="bold" letter-spacing="2" text-anchor="end">PLANTAS</text>
  <text x="${W - L}" y="${numY}" font-size="52" font-weight="bold" fill="#1a2a1a" font-family="monospace" text-anchor="end"> </text>
  <line x1="${L}" y1="${sepY}" x2="${W - L}" y2="${sepY}" stroke="#e0e0e0" stroke-width="0.5"/>
  <rect x="${L}" y="${varietyY}" width="${W - 2*L}" height="${varietyH}" rx="6" fill="#f5f5f5" stroke="#ddd" stroke-width="1" stroke-dasharray="6,4"/>
  <line x1="${L}" y1="${bottomY}" x2="${W - L}" y2="${bottomY}" stroke="#e0e0e0" stroke-width="0.5"/>
  <text x="${L}" y="${bottomY + 22}" font-size="13" fill="#444" font-family="monospace">AÑO: ______</text>
  <text x="${W - L}" y="${bottomY + 22}" font-size="11" fill="#999" class="w" text-anchor="end">www.lupulosrionegro.com</text>
</svg>`
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)
  const svgImg = new Image()
  const logoImg = new Image()
  let loaded = 0
  const targetW = format === 'a4' ? 3508 : 2480
  const scale = targetW / W
  const actualH = Math.round(svgH * scale)
  const render = () => {
    loaded++
    if (loaded < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = actualH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetW, actualH)
    ctx.scale(scale, scale)
    ctx.drawImage(svgImg, 0, 0)
    ctx.drawImage(logoImg, W/2 - 14, 12, 28, 28)
    const a = document.createElement('a')
    a.download = `cartel-vacio-${format.toUpperCase()}.jpg`
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.click()
    URL.revokeObjectURL(svgUrl)
  }
  svgImg.onload = render
  svgImg.onerror = () => URL.revokeObjectURL(svgUrl)
  logoImg.onload = render
  logoImg.onerror = render
  svgImg.src = svgUrl
  logoImg.src = window.location.origin + '/logo-lupulos.png'
}

type LogEntry = { id: number; action: string; summary: string; userEmail: string; createdAt: string }

function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [refreshing, setRefreshing] = useState(0)

  useEffect(() => {
    fetch('/api/admin/audit').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLogs(data.slice(0, 50))
    }).catch(() => {})
  }, [refreshing])

  const iconMap: Record<string, string> = { created: '➕', updated: '✏️', deleted: '🗑️' }

  if (logs.length === 0) {
    return <div style={{ fontSize: 10, color: '#636366', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>Sin actividad todavía</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {logs.map(l => {
        const hasPlantas = l.summary.includes('plantas:')
        return (
          <div key={l.id} style={{
            fontSize: 10, fontFamily: "'SF Pro Text', system-ui, sans-serif", lineHeight: 1.4,
            background: hasPlantas ? 'rgba(255,69,58,0.06)' : 'transparent',
            borderLeft: hasPlantas ? '2px solid #ff453a' : '2px solid transparent',
            paddingLeft: hasPlantas ? 6 : 8,
            borderRadius: 2,
          }}>
            <div>
              <span style={{ color: '#98989d' }}>{l.summary}</span>
            </div>
            <div style={{ color: '#636366', fontSize: 9, marginTop: 1 }}>
              {l.userEmail.split('@')[0]} · {new Date(l.createdAt).toLocaleString('es-AR')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
