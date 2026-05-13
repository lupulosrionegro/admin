'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-rotate'

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

function getColorForVariedad(nombre: string): string {
  const lower = nombre.toLowerCase()
  const colors: Record<string, string> = {
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
  if (colors[lower]) return colors[lower]
  const fallback = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#673ab7', '#f39c12']
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) | 0
  return fallback[Math.abs(hash) % fallback.length]
}

function distanciaAPunto(lat1: number, lng1: number, lat2: number, lng2: number, plat: number, plng: number) {
  const A = plat - lat1
  const B = plng - lng1
  const C = lat2 - lat1
  const D = lng2 - lng1
  const dot = A * C + B * D
  const len2 = C * C + D * D
  let t = -1
  if (len2 > 0) t = dot / len2
  let projLat: number, projLng: number
  if (t < 0) { projLat = lat1; projLng = lng1 }
  else if (t > 1) { projLat = lat2; projLng = lng2 }
  else { projLat = lat1 + t * C; projLng = lng1 + t * D }
  const dx = plat - projLat
  const dy = plng - projLng
  const distLatM = dx * 111320
  const distLngM = dy * 111320 * Math.cos(plat * Math.PI / 180)
  return Math.sqrt(distLatM * distLatM + distLngM * distLngM)
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

const startIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#5fba7a;border:3px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,.6)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export default function MapComponent({
  hileras, selectedIdx, viewMode, variedades, bearing, onBearingChange, onHileraDrawn, onSelect,
}: {
  hileras: Hilera[]
  selectedIdx: number | null
  viewMode: 'draw' | 'select'
  variedades: Variedad[]
  bearing: number
  onBearingChange: (b: number) => void
  onHileraDrawn: (data: { lat1: number; lng1: number; lat2: number; lng2: number; longitud_m: number }) => void
  onSelect: (idx: number | null) => void
}) {
  const mapRef = useRef<L.Map | null>(null)
  const drawLayerRef = useRef<L.LayerGroup | null>(null)
  const startMarkerRef = useRef<L.Marker | null>(null)
  const tempLineRef = useRef<L.Polyline | null>(null)
  const drawingRef = useRef(false)
  const startPointRef = useRef<{ lat: number; lng: number } | null>(null)
  const viewModeRef = useRef(viewMode)
  const hilerasRef = useRef(hileras)

  hilerasRef.current = hileras
  viewModeRef.current = viewMode

  const getVariedadNombre = useCallback((h: Hilera) => {
    if (h.split) {
      const vA = variedades.find(v => v.id === h.variedad_a_id)
      const vB = variedades.find(v => v.id === h.variedad_b_id)
      return (vA?.nombre || '?') + ' / ' + (vB?.nombre || '?')
    }
    const v = variedades.find(v => v.id === h.variedad_id)
    return v?.nombre || '?'
  }, [variedades])

  useEffect(() => {
    if (mapRef.current) return
    const el = document.getElementById('hileras-map')
    if (!el || !el.parentElement) return

    const map = L.map('hileras-map', {
      maxZoom: 24,
      minZoom: 15,
      zoomSnap: 0,
      zoomDelta: 0.5,
      zoomControl: false,
      rotate: true,
      bearing: bearing,
    } as any).setView(CHACRA_CENTER, CHACRA_ZOOM)

    const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Earthstar Geographics',
      maxZoom: 24,
      maxNativeZoom: 19,
      noWrap: true,
    }).addTo(map)

    requestAnimationFrame(() => { map.invalidateSize() })
    setTimeout(() => { map.invalidateSize() }, 300)

    const drawLayer = L.layerGroup().addTo(map)
    drawLayerRef.current = drawLayer
    mapRef.current = map

    const hint = document.getElementById('hint')

    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      if (drawingRef.current) {
        L.DomEvent.preventDefault(e.originalEvent)
        cleanUpDrawing(map)
        if (hint) hint.textContent = '📍 Hacé clic en el mapa para empezar una hilera → segundo clic para finalizar'
      }
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (viewModeRef.current === 'draw') {
        if (!drawingRef.current) {
          drawingRef.current = true
          startPointRef.current = e.latlng
          const marker = L.marker(e.latlng, { icon: startIcon, interactive: false }).addTo(map)
          startMarkerRef.current = marker
          const line = L.polyline([e.latlng, e.latlng], {
            color: '#5fba7a',
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 6',
          }).addTo(map)
          tempLineRef.current = line
          if (hint) hint.textContent = '📍 Primer punto listo. Hacé clic en otro punto para finalizar la hilera (podés arrastrar el mapa libremente entre clics)'
        } else {
          const endPoint = e.latlng
          if (startPointRef.current) {
            const dist = calcularDistancia(startPointRef.current.lat, startPointRef.current.lng, endPoint.lat, endPoint.lng)
            if (dist > 2) {
              onHileraDrawn({
                lat1: startPointRef.current.lat,
                lng1: startPointRef.current.lng,
                lat2: endPoint.lat,
                lng2: endPoint.lng,
                longitud_m: dist,
              })
            }
          }
          cleanUpDrawing(map)
          if (hint) hint.textContent = '📍 Hacé clic en el mapa para empezar una hilera → segundo clic para finalizar'
        }
      } else if (viewModeRef.current === 'select') {
        let clickedIdx: number | null = null
        const hList = hilerasRef.current
        for (let i = 0; i < hList.length; i++) {
          const h = hList[i]
          const dist = distanciaAPunto(h.lat1, h.lng1, h.lat2, h.lng2, e.latlng.lat, e.latlng.lng)
          if (dist < 25) {
            clickedIdx = i
            break
          }
        }
        onSelect(clickedIdx)
      }
    })

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const ci = document.getElementById('coord-info')
      if (ci) ci.innerHTML = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)} · Zoom: ${map.getZoom()}`
      if (drawingRef.current && tempLineRef.current && startPointRef.current) {
        tempLineRef.current.setLatLngs([startPointRef.current, e.latlng])
      }
    })

    map.on('zoomend', () => {
      const zi = document.getElementById('zoom-info')
      if (zi) zi.textContent = String(map.getZoom())
    })

    return () => {
      try { map.remove() } catch {}
      mapRef.current = null
    }
  }, [])

  function cleanUpDrawing(map: L.Map) {
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current)
      startMarkerRef.current = null
    }
    if (tempLineRef.current) {
      map.removeLayer(tempLineRef.current)
      tempLineRef.current = null
    }
    drawingRef.current = false
    startPointRef.current = null
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (viewMode !== 'draw') {
      cleanUpDrawing(map)
    }
    const hint = document.getElementById('hint')
    if (hint) {
      if (viewMode === 'draw') {
        hint.textContent = '📍 Hacé clic en el mapa para empezar una hilera → segundo clic para finalizar'
      } else {
        hint.textContent = '🔍 Hacé clic en una hilera para seleccionarla'
      }
    }
  }, [viewMode])

  useEffect(() => {
    const map = mapRef.current as any
    if (!map || !map.setBearing) return
    map.setBearing(bearing)
  }, [bearing])

  useEffect(() => {
    const map = mapRef.current
    const drawLayer = drawLayerRef.current
    if (!map || !drawLayer) return

    drawLayer.clearLayers()

    hilerasRef.current.forEach((h, idx) => {
      const nombreV = getVariedadNombre(h)
      const color = getColorForVariedad(nombreV)

      if (h.split) {
        const coords: [[number, number], [number, number]] = [[h.lat1, h.lng1], [h.lat2, h.lng2]]
        const colorA = getColorForVariedad(variedades.find(v => v.id === h.variedad_a_id)?.nombre || '')
        const colorB = getColorForVariedad(variedades.find(v => v.id === h.variedad_b_id)?.nombre || '')
        const w = selectedIdx === idx ? 6 : 4

        const lineA = L.polyline(coords, {
          color: colorA, weight: w, opacity: 0.9, dashArray: '12, 12',
        }).addTo(drawLayer)
        const lineB = L.polyline(coords, {
          color: colorB, weight: w, opacity: 0.9, dashArray: '0, 12, 12, 0',
        }).addTo(drawLayer)

        const label = `P${h.poste || '?'} · ${getVariedadNombre(h)} · ${h.longitud_m.toFixed(1)} m`
        lineA.bindTooltip(label, { permanent: false, direction: 'center' })
        lineB.bindTooltip(label, { permanent: false, direction: 'center' })
      } else {
        const coords: [[number, number], [number, number]] = [[h.lat1, h.lng1], [h.lat2, h.lng2]]
        const line = L.polyline(coords, {
          color, weight: selectedIdx === idx ? 6 : 4, opacity: 0.9,
        }).addTo(drawLayer)

        const posteLabel = h.poste ? `P${h.poste} · ` : ''
        const area = (h.longitud_m * h.ancho_m) / 10000
        line.bindTooltip(`${posteLabel}${nombreV} · ${h.longitud_m.toFixed(1)} m · ${area.toFixed(2)} ha`, {
          permanent: false, direction: 'center',
        })
      }

      const markerIcon = L.divIcon({ className: '', html: '●', iconSize: [8, 8] })
      L.marker([h.lat1, h.lng1], { icon: markerIcon, interactive: false }).addTo(drawLayer)
      L.marker([h.lat2, h.lng2], { icon: markerIcon, interactive: false }).addTo(drawLayer)
    })
  }, [hileras, selectedIdx, getVariedadNombre])

  return (
    <div style={{ flex: 1, position: 'relative', background: '#111' }}>
      <div id="hileras-map" style={{ height: '100%', width: '100%', background: '#1a1a1a' }} />
      <div id="hint" style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.08)', color: '#98989d', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 10, padding: '5px 12px', borderRadius: 8, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1000 }}>
        📍 Hacé clic en el mapa para empezar una hilera → segundo clic para finalizar
      </div>
      <div id="coord-info" style={{ position: 'absolute', top: 8, right: 8, fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 9, color: '#636366', background: 'rgba(28,28,30,0.8)', padding: '3px 9px', borderRadius: 6, zIndex: 1000, pointerEvents: 'none' }}>
        Lat: -39.1468, Lng: -67.1482
      </div>
      <div style={{ position: 'absolute', bottom: 20, right: 10, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
        <button onClick={() => mapRef.current?.zoomIn()} style={{ width: 36, height: 36, background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#f5f5f7', fontSize: 18, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>+</button>
        <button onClick={() => mapRef.current?.zoomOut()} style={{ width: 36, height: 36, background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#f5f5f7', fontSize: 18, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>−</button>
        <button onClick={() => mapRef.current?.setView(CHACRA_CENTER, CHACRA_ZOOM)} style={{ width: 36, height: 36, background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#f5f5f7', fontSize: 14, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>⌂</button>
        <div style={{ height: 0.5, background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
        <button onClick={() => onBearingChange(bearing - 5)} style={{ width: 36, height: 36, background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#98989d', fontSize: 14, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>↶</button>
        <div style={{ fontSize: 9, fontFamily: "'SF Pro Text', system-ui, sans-serif", color: '#636366', textAlign: 'center', background: 'rgba(28,28,30,0.9)', padding: '2px 0', borderRadius: 6 }}>{bearing}°</div>
        <button onClick={() => onBearingChange(bearing + 5)} style={{ width: 36, height: 36, background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#98989d', fontSize: 14, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'SF Pro Text', system-ui, sans-serif" }}>↷</button>
      </div>
      <div id="hint" style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.08)', color: '#98989d', fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 10, padding: '5px 12px', borderRadius: 8, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1000 }}>
        📍 Hacé clic en el mapa para empezar una hilera → segundo clic para finalizar
      </div>
      <div id="coord-info" style={{ position: 'absolute', top: 8, right: 8, fontFamily: "'SF Pro Text', system-ui, sans-serif", fontSize: 9, color: '#636366', background: 'rgba(28,28,30,0.8)', padding: '3px 9px', borderRadius: 6, zIndex: 1000, pointerEvents: 'none' }}>
        Lat: -39.1468, Lng: -67.1482
      </div>
    </div>
  )
}
